import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check() {
    return this.healthService.checkHealth();
  }

  @Get('ready')
  async ready() {
    const health = await this.healthService.checkHealth();
    return {
      ready: health.status === 'healthy',
      ...health,
    };
  }
}
