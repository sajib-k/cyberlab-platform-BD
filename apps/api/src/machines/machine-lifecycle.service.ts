import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MachineState } from '@prisma/client';

@Injectable()
export class MachineLifecycleService {
  private readonly logger = new Logger(MachineLifecycleService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Start a lab instance for a machine
   */
  async startLab(userId: string, machineId: string) {
    this.logger.log(`Starting lab for user ${userId} on machine ${machineId}`);

    // Check if machine exists
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${machineId} not found`);
    }

    // Check if user already has an active lab instance
    const activeInstance = await this.prisma.labInstance.findFirst({
      where: {
        userId,
        status: {
          in: [MachineState.STARTING, MachineState.RUNNING],
        },
      },
    });

    if (activeInstance) {
      throw new BadRequestException('User already has an active or starting lab instance');
    }

    // Create a new lab instance record with STARTING status
    const labInstance = await this.prisma.labInstance.create({
      data: {
        userId,
        machineId,
        status: MachineState.STARTING,
        providerRuntimeId: `mock-container-${Date.now()}`,
        connectionInfo: {
          hostPort: Math.floor(Math.random() * (60000 - 50000 + 1)) + 50000,
        },
      },
    });

    // Simulate asynchronous initialization/transition to RUNNING status
    setTimeout(async () => {
      try {
        await this.prisma.labInstance.update({
          where: { id: labInstance.id },
          data: { status: MachineState.RUNNING },
        });
        this.logger.log(`Lab instance ${labInstance.id} is now RUNNING`);
      } catch (error) {
        this.logger.error(`Failed to update lab instance status to RUNNING`, error);
      }
    }, 3000);

    return {
      message: 'Lab instance creation initiated',
      instance: labInstance,
    };
  }

  /**
   * Stop an active lab instance
   */
  async stopLab(userId: string, instanceId: string) {
    this.logger.log(`Stopping lab instance ${instanceId} for user ${userId}`);

    const labInstance = await this.prisma.labInstance.findUnique({
      where: { id: instanceId },
    });

    if (!labInstance || labInstance.userId !== userId) {
      throw new NotFoundException(`Lab instance not found or unauthorized`);
    }

    if (labInstance.status === MachineState.STOPPED || labInstance.status === MachineState.EXPIRED) {
      throw new BadRequestException('Lab instance is already stopped or expired');
    }

    const updatedInstance = await this.prisma.labInstance.update({
      where: { id: instanceId },
      data: {
        status: MachineState.STOPPED,
        stoppedAt: new Date(),
      },
    });

    return {
      message: 'Lab instance stopped successfully',
      instance: updatedInstance,
    };
  }

  /**
   * Get active lab for user
   */
  async getUserActiveLab(userId: string) {
    return this.prisma.labInstance.findFirst({
      where: {
        userId,
        status: {
          in: [MachineState.STARTING, MachineState.RUNNING],
        },
      },
      include: {
        machine: true,
      },
    });
  }
}
