import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../common/infrastructure/redis/redis.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService, PrismaService, RedisService],
})
export class HealthModule {}
