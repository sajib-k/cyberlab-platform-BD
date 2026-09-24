import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';

@Injectable()
export class LearningPathService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeUnpublished = false) {
    const where = includeUnpublished ? {} : { published: true };
    return (this.prisma.learningPath.findMany as any)({
      where,
    });
  }

  async findBySlug(slug: string) {
    const path = await (this.prisma.learningPath.findUnique as any)({
      where: { slug },
      include: {
        courses: true,
      },
    });

    if (!path) {
      throw new NotFoundException('Learning path not found');
    }

    return path;
  }

  async create(dto: CreateLearningPathDto) {
    try {
      return await (this.prisma.learningPath.create as any)({
        data: {
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
      throw new ConflictException('Learning path with this slug already exists or invalid data');
    }
  }
}
