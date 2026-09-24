import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return this.toSafeProfile(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileResponseDto> {
    // If username is being updated, check if it's already taken
    if (dto.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Username is already taken');
      }
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(dto.username && { username: dto.username }),
          ...(dto.bio !== undefined && { bio: dto.bio }),
          ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        },
      });

      return this.toSafeProfile(updatedUser);
    } catch (error) {
      throw new ConflictException('Could not update profile. Username might already exist.');
    }
  }

  async getPublicProfile(username: string): Promise<ProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toSafeProfile(user);
  }

  private toSafeProfile(user: any): ProfileResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      points: user.points,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }
}
