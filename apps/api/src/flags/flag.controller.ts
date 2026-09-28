import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { FlagService } from './flag.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('flags')
@UseGuards(JwtAuthGuard)
export class FlagController {
  constructor(private readonly flagService: FlagService) {}

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  async submitFlag(
    @Req() req: any,
    @Body() body: { flagId: string; value: string },
  ) {
    const userId = req.user.id || req.user.userId;
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];

    return this.flagService.submitFlag(
      userId,
      body.flagId,
      body.value,
      ipAddress,
      userAgent,
    );
  }

  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  async createFlag(
    @Body() body: { machineId?: string; taskId?: string; name: string; plaintextFlag: string; points?: number },
  ) {
    return this.flagService.createFlag(body);
  }
}
