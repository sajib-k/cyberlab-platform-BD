import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class FlagService {
  private readonly logger = new Logger(FlagService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Securely hash a plaintext flag using SHA-256 with a secret application pepper
   */
  private hashFlag(plaintext: string): string {
    const pepper = process.env.FLAG_SECRET_PEPPER || 'cyberlab-secure-pepper-2026';
    return crypto
      .createHmac('sha256', pepper)
      .update(plaintext.trim())
      .digest('hex');
  }

  /**
   * Constant-time comparison to prevent timing attacks
   */
  private secureCompare(hashA: string, hashB: string): boolean {
    try {
      const bufA = Buffer.from(hashA, 'hex');
      const bufB = Buffer.from(hashB, 'hex');
      if (bufA.length !== bufB.length) return false;
      return crypto.timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }

  /**
   * Admin: Create a new secure flag
   */
  async createFlag(dto: { machineId?: string; taskId?: string; name: string; plaintextFlag: string; points?: number }) {
    const flagHash = this.hashFlag(dto.plaintextFlag);

    const flag = await this.prisma.flag.create({
      data: {
        machineId: dto.machineId || null,
        taskId: dto.taskId || null,
        name: dto.name,
        flagHash,
        points: dto.points ?? 50,
        isActive: true,
      },
    });

    return {
      id: flag.id,
      name: flag.name,
      points: flag.points,
      isActive: flag.isActive,
      createdAt: flag.createdAt,
    };
  }

  /**
   * Submit and validate a flag candidate securely
   */
  async submitFlag(userId: string, flagId: string, candidateValue: string, ipAddress?: string, userAgent?: string) {
    if (!candidateValue || typeof candidateValue !== 'string') {
      throw new BadRequestException('Invalid flag submission payload.');
    }

    // 1. Fetch Flag entity
    const flag = await this.prisma.flag.findUnique({
      where: { id: flagId },
      include: {
        machine: { include: { room: true } },
        task: { include: { room: true } },
      },
    });

    if (!flag || !flag.isActive) {
      throw new NotFoundException('Flag not found or inactive.');
    }

    // 2. Check if user already solved this flag successfully
    const existingCorrectSubmission = await this.prisma.submission.findFirst({
      where: {
        userId,
        flagId,
        correct: true,
      },
    });

    if (existingCorrectSubmission) {
      return {
        correct: true,
        alreadySolved: true,
        pointsAwarded: 0,
        message: 'Challenge already solved.',
      };
    }

    // 3. Rate limiting check (e.g. max 5 attempts per minute per user/flag)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentAttemptsCount = await this.prisma.submission.count({
      where: {
        userId,
        flagId,
        createdAt: { gte: oneMinuteAgo },
      },
    });

    if (recentAttemptsCount >= 5) {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'FLAG_SUBMISSION_RATE_LIMITED',
          entityType: 'Flag',
          entityId: flagId,
          ipAddress,
          userAgent,
        },
      });
      throw new BadRequestException('Too many attempts. Please wait a minute before trying again.');
    }

    // 4. Secure Hash candidate and compare
    const submittedValueHash = this.hashFlag(candidateValue);
    const isCorrect = this.secureCompare(submittedValueHash, flag.flagHash);

    let pointsAwarded = 0;

    // Use transaction to ensure atomicity for correct flags
    if (isCorrect) {
      pointsAwarded = flag.points;

      await this.prisma.$transaction(async (tx) => {
        // Record successful submission
        await tx.submission.create({
          data: {
            userId,
            flagId,
            answerHash: submittedValueHash,
            correct: true,
            pointsAwarded,
          },
        });

        // Award XP and Points to User
        await tx.user.update({
          where: { id: userId },
          data: {
            points: { increment: pointsAwarded },
            xp: { increment: pointsAwarded },
          },
        });

        // Update Progress if linked to a Task or Room
        if (flag.taskId) {
          await tx.progress.upsert({
            where: {
              userId_roomId_taskId_questionId: {
                userId,
                roomId: flag.task?.roomId || '',
                taskId: flag.taskId,
                questionId: '',
              },
            },
            create: {
              userId,
              roomId: flag.task?.roomId,
              taskId: flag.taskId,
              completed: true,
              completedAt: new Date(),
            },
            update: {
              completed: true,
              completedAt: new Date(),
            },
          });
        }

        // Write Audit Log
        await tx.auditLog.create({
          data: {
            userId,
            action: 'FLAG_SUBMISSION_CORRECT',
            entityType: 'Flag',
            entityId: flagId,
            metadata: { pointsAwarded },
            ipAddress,
            userAgent,
          },
        });
      });

      return {
        correct: true,
        alreadySolved: false,
        pointsAwarded,
        message: 'Correct flag!',
      };
    } else {
      // Record incorrect submission
      await this.prisma.submission.create({
        data: {
          userId,
          flagId,
          answerHash: submittedValueHash,
          correct: false,
          pointsAwarded: 0,
        },
      });

      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'FLAG_SUBMISSION_INCORRECT',
          entityType: 'Flag',
          entityId: flagId,
          ipAddress,
          userAgent,
        },
      });

      return {
        correct: false,
        alreadySolved: false,
        pointsAwarded: 0,
        message: 'Incorrect flag.',
      };
    }
  }
}
