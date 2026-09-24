import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  async getHealth() {
    const isDbConnected = await this.prismaService.isHealthy();

    return {
      status: isDbConnected ? 'ok' : 'error',
      service: 'cyberlab-api',
      database: isDbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}
