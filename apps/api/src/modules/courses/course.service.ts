import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeUnpublished = false) {
    const where = includeUnpublished ? {} : { published: true };
    return (this.prisma.course.findMany as any)({
      where,
      orderBy: { order: 'asc' },
      include: {
        learningPath: {
          select: { id: true, title: true, slug: true },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const course = await (this.prisma.course.findUnique as any)({
      where: { slug },
      include: {
        learningPath: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async findByLearningPathSlug(pathSlug: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { slug: pathSlug },
    });

    if (!path) {
      throw new NotFoundException('Learning path not found');
    }

    return (this.prisma.course.findMany as any)({
      where: { learningPathId: path.id, published: true },
      orderBy: { order: 'asc' },
    });
  }

  async create(dto: CreateCourseDto) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id: dto.learningPathId },
    });

    if (!path) {
      throw new NotFoundException('Parent learning path not found');
    }

    try {
      return await (this.prisma.course.create as any)({
        data: {
          learningPathId: dto.learningPathId,
          title: dto.title,
          slug: dto.slug,
          description: dto.description,
          ...(dto.difficulty && { difficulty: dto.difficulty }),
          ...(dto.imageUrl && { imageUrl: dto.imageUrl }),
          published: dto.published ?? false,
          order: dto.order ?? 0,
        },
      });
    } catch (error) {
      throw new ConflictException('Course with this slug already exists or invalid data');
    }
  }
}
