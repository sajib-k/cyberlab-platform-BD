import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditLogService } from './audit-log.service';
import { ContentAdminService } from './content-admin.service';
import { ContentAdminController } from './content-admin.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController, ContentAdminController],
  providers: [AdminService, AuditLogService, ContentAdminService],
  exports: [AuditLogService],
})
export class AdminModule {}
