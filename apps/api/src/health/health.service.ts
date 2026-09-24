import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../common/infrastructure/redis/redis.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async checkHealth() {
    let dbStatus = 'connected';
    let redisStatus = 'connected';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'down';
    }

    const redisHealthy = await this.redisService.isHealthy();
    if (!redisHealthy) {
      redisStatus = 'down';
    }

    const isHealthy = dbStatus === 'connected' && redisStatus === 'connected';

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    };
  }
}
