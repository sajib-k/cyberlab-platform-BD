import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    return {
      users: { total: 0 },
      content: { learningPaths: 0, courses: 0, rooms: 0, tasks: 0, questions: 0 },
      system: { status: 'ok', version: '1.0.0' },
    };
  }
}
