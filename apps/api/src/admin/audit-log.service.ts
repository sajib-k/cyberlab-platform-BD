import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}
  async record(params: any) {}
  async getLogs(page = 1, limit = 20) {
    return { items: [], page, limit, total: 0 };
  }
}
