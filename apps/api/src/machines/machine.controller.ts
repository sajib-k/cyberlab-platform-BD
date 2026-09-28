import { Controller, Post, Get, Param, Req } from '@nestjs/common';
import { MachineLifecycleService } from './machine-lifecycle.service';

@Controller('machines')
export class MachineController {
  constructor(private readonly machineLifecycleService: MachineLifecycleService) {}

  @Post(':machineId/start')
  async startLab(@Param('machineId') machineId: string, @Req() req: any) {
    const userId = req.user?.id || req.headers['x-user-id'] || 'mock-user-id';
    return this.machineLifecycleService.startLab(userId, machineId);
  }

  @Post('instances/:instanceId/stop')
  async stopLab(@Param('instanceId') instanceId: string, @Req() req: any) {
    const userId = req.user?.id || req.headers['x-user-id'] || 'mock-user-id';
    return this.machineLifecycleService.stopLab(userId, instanceId);
  }

  @Get('active')
  async getUserActiveLab(@Req() req: any) {
    const userId = req.user?.id || req.headers['x-user-id'] || 'mock-user-id';
    return this.machineLifecycleService.getUserActiveLab(userId);
  }
}
