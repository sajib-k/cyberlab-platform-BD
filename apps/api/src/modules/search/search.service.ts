import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // আপনার প্রজেক্টের PrismaService পাথ অনুযায়ী এডজাস্ট হতে পারে

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchAll(query: string, limit = 5) {
    if (!query || query.trim() === '') {
      return { learningPaths: [], courses: [], rooms: [], tasks: [] };
    }

    const searchTerm = query.trim();

    const [learningPaths, courses, rooms, tasks] = await Promise.all([
      this.prisma.learningPath.findMany({
        where: {
          published: true,
          title: { contains: searchTerm, mode: 'insensitive' },
        },
        take: limit,
        select: { id: true, title: true, slug: true, difficulty: true, imageUrl: true },
      }),
      this.prisma.course.findMany({
        where: {
          published: true,
          title: { contains: searchTerm, mode: 'insensitive' },
        },
        take: limit,
        select: { id: true, title: true, slug: true, difficulty: true, learningPathId: true },
      }),
      this.prisma.room.findMany({
        where: {
          published: true,
          title: { contains: searchTerm, mode: 'insensitive' },
        },
        take: limit,
        select: { id: true, title: true, slug: true, difficulty: true, estimatedMinutes: true, courseId: true },
      }),
      this.prisma.task.findMany({
        where: {
          title: { contains: searchTerm, mode: 'insensitive' },
        },
        take: limit,
        select: { id: true, title: true, slug: true, roomId: true },
      }),
    ]);

    return {
      learningPaths,
      courses,
      rooms,
      tasks,
    };
  }
}
