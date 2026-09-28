import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get('overview')
  async getOverview() {
    return this.adminService.getOverview();
  }

  @Get('audit-logs')
  async getAuditLogs(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.auditLogService.getLogs(parseInt(page, 10), parseInt(limit, 10));
  }
}
