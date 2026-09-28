import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class ContentAdminService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // --- LEARNING PATHS ---
  async getLearningPaths(page = 1, limit = 20, filters?: { published?: boolean; difficulty?: string }) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters?.published !== undefined) where.published = filters.published;
    if (filters?.difficulty) where.difficulty = filters.difficulty;

    const [items, total] = await Promise.all([
      this.prisma.learningPath.findMany({ skip, take: limit, where, orderBy: { position: 'asc' } } as any),
      this.prisma.learningPath.count({ where } as any),
    ]);
    return { items, page, limit, total };
  }

  async getLearningPathById(id: string) {
    const item = await this.prisma.learningPath.findUnique({ where: { id } } as any);
    if (!item) throw new NotFoundException('Learning Path not found');
    return item;
  }

  async createLearningPath(userId: string, data: any, ip?: string, ua?: string) {
    const slug = data.slug || this.generateSlug(data.title);
    const existing = await this.prisma.learningPath.findUnique({ where: { slug } } as any);
    if (existing) throw new BadRequestException('Learning Path with this slug already exists');

    const created = await this.prisma.learningPath.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        difficulty: data.difficulty || 'BEGINNER',
        image: data.image || null,
        position: data.position || 0,
        published: data.published || false,
      },
    } as any);

    await this.auditLog.record({
      userId,
      action: 'CONTENT_CREATED',
      entityType: 'LearningPath',
      entityId: created.id,
      metadata: { title: created.title, slug },
      ipAddress: ip,
      userAgent: ua,
    });

    return created;
  }

  async updateLearningPath(userId: string, id: string, data: any, ip?: string, ua?: string) {
    await this.getLearningPathById(id);
    if (data.slug) {
      const existing = await this.prisma.learningPath.findFirst({ where: { slug: data.slug } } as any);
      if (existing && existing.id !== id) throw new BadRequestException('Slug already in use');
    }

    const updated = await this.prisma.learningPath.update({
      where: { id },
      data,
    } as any);

    await this.auditLog.record({
      userId,
      action: 'CONTENT_UPDATED',
      entityType: 'LearningPath',
      entityId: id,
      metadata: { title: updated.title },
      ipAddress: ip,
      userAgent: ua,
    });

    return updated;
  }

  async deleteLearningPath(userId: string, id: string, ip?: string, ua?: string) {
    const lp = await this.prisma.learningPath.findUnique({ where: { id } } as any);
    if (!lp) throw new NotFoundException('Learning Path not found');

    await this.prisma.learningPath.delete({ where: { id } } as any);
    await this.auditLog.record({
      userId,
      action: 'CONTENT_DELETED',
      entityType: 'LearningPath',
      entityId: id,
      metadata: { title: lp.title },
      ipAddress: ip,
      userAgent: ua,
    });

    return { success: true };
  }

  // --- COURSES ---
  async getCourses(page = 1, limit = 20, filters?: { learningPathId?: string; published?: boolean }) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters?.learningPathId) where.learningPathId = filters.learningPathId;
    if (filters?.published !== undefined) where.published = filters.published;

    const [items, total] = await Promise.all([
      this.prisma.course.findMany({ skip, take: limit, where, orderBy: { position: 'asc' } } as any),
      this.prisma.course.count({ where } as any),
    ]);
    return { items, page, limit, total };
  }

  async createCourse(userId: string, data: any, ip?: string, ua?: string) {
    const lp = await this.prisma.learningPath.findUnique({ where: { id: data.learningPathId } } as any);
    if (!lp) throw new BadRequestException('Parent Learning Path does not exist');

    const slug = data.slug || this.generateSlug(data.title);
    const created = await this.prisma.course.create({
      data: {
        learningPathId: data.learningPathId,
        title: data.title,
        slug,
        description: data.description,
        difficulty: data.difficulty || 'BEGINNER',
        image: data.image || null,
        position: data.position || 0,
        published: data.published || false,
      },
    } as any);

    await this.auditLog.record({ userId, action: 'CONTENT_CREATED', entityType: 'Course', entityId: created.id, metadata: { title: created.title }, ipAddress: ip, userAgent: ua });
    return created;
  }

  async updateCourse(userId: string, id: string, data: any, ip?: string, ua?: string) {
    const course = await this.prisma.course.findUnique({ where: { id } } as any);
    if (!course) throw new NotFoundException('Course not found');

    if (data.learningPathId) {
      const lp = await this.prisma.learningPath.findUnique({ where: { id: data.learningPathId } } as any);
      if (!lp) throw new BadRequestException('Parent Learning Path does not exist');
    }

    const updated = await this.prisma.course.update({ where: { id }, data } as any);
    await this.auditLog.record({ userId, action: 'CONTENT_UPDATED', entityType: 'Course', entityId: id, metadata: { title: updated.title }, ipAddress: ip, userAgent: ua });
    return updated;
  }

  async deleteCourse(userId: string, id: string, ip?: string, ua?: string) {
    const course = await this.prisma.course.findUnique({ where: { id } } as any);
    if (!course) throw new NotFoundException('Course not found');

    await this.prisma.course.delete({ where: { id } } as any);
    await this.auditLog.record({ userId, action: 'CONTENT_DELETED', entityType: 'Course', entityId: id, metadata: { title: course.title }, ipAddress: ip, userAgent: ua });
    return { success: true };
  }

  // --- ROOMS ---
  async getRooms(page = 1, limit = 20, filters?: { courseId?: string; published?: boolean }) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters?.courseId) where.courseId = filters.courseId;
    if (filters?.published !== undefined) where.published = filters.published;

    const [items, total] = await Promise.all([
      this.prisma.room.findMany({ skip, take: limit, where, orderBy: { position: 'asc' } } as any),
      this.prisma.room.count({ where } as any),
    ]);
    return { items, page, limit, total };
  }

  async createRoom(userId: string, data: any, ip?: string, ua?: string) {
    const course = await this.prisma.course.findUnique({ where: { id: data.courseId } } as any);
    if (!course) throw new BadRequestException('Parent Course does not exist');

    const slug = data.slug || this.generateSlug(data.title);
    const created = await this.prisma.room.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        slug,
        description: data.description,
        difficulty: data.difficulty || 'BEGINNER',
        estimatedMinutes: data.estimatedMinutes || 30,
        image: data.image || null,
        position: data.position || 0,
        published: data.published || false,
      },
    } as any);

    await this.auditLog.record({ userId, action: 'CONTENT_CREATED', entityType: 'Room', entityId: created.id, metadata: { title: created.title }, ipAddress: ip, userAgent: ua });
    return created;
  }

  async updateRoom(userId: string, id: string, data: any, ip?: string, ua?: string) {
    const room = await this.prisma.room.findUnique({ where: { id } } as any);
    if (!room) throw new NotFoundException('Room not found');
    const updated = await this.prisma.room.update({ where: { id }, data } as any);
    await this.auditLog.record({ userId, action: 'CONTENT_UPDATED', entityType: 'Room', entityId: id, metadata: { title: updated.title }, ipAddress: ip, userAgent: ua });
    return updated;
  }

  async deleteRoom(userId: string, id: string, ip?: string, ua?: string) {
    const room = await this.prisma.room.findUnique({ where: { id } } as any);
    if (!room) throw new NotFoundException('Room not found');

    await this.prisma.room.delete({ where: { id } } as any);
    await this.auditLog.record({ userId, action: 'CONTENT_DELETED', entityType: 'Room', entityId: id, metadata: { title: room.title }, ipAddress: ip, userAgent: ua });
    return { success: true };
  }

  // --- TASKS ---
  async getTasks(page = 1, limit = 20, filters?: { roomId?: string; published?: boolean }) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters?.roomId) where.roomId = filters.roomId;
    if (filters?.published !== undefined) where.published = filters.published;

    const [items, total] = await Promise.all([
      this.prisma.task.findMany({ skip, take: limit, where, orderBy: { position: 'asc' } } as any),
      this.prisma.task.count({ where } as any),
    ]);
    return { items, page, limit, total };
  }

  async createTask(userId: string, data: any, ip?: string, ua?: string) {
    const room = await this.prisma.room.findUnique({ where: { id: data.roomId } } as any);
    if (!room) throw new BadRequestException('Parent Room does not exist');

    const slug = data.slug || this.generateSlug(data.title);
    const created = await this.prisma.task.create({
      data: {
        roomId: data.roomId,
        title: data.title,
        slug,
        content: data.content || '',
        position: data.position || 0,
        published: data.published || false,
      },
    } as any);

    await this.auditLog.record({ userId, action: 'CONTENT_CREATED', entityType: 'Task', entityId: created.id, metadata: { title: created.title }, ipAddress: ip, userAgent: ua });
    return created;
  }

  async updateTask(userId: string, id: string, data: any, ip?: string, ua?: string) {
    const task = await this.prisma.task.findUnique({ where: { id } } as any);
    if (!task) throw new NotFoundException('Task not found');
    const updated = await this.prisma.task.update({ where: { id }, data } as any);
    await this.auditLog.record({ userId, action: 'CONTENT_UPDATED', entityType: 'Task', entityId: id, metadata: { title: updated.title }, ipAddress: ip, userAgent: ua });
    return updated;
  }

  async deleteTask(userId: string, id: string, ip?: string, ua?: string) {
    const task = await this.prisma.task.findUnique({ where: { id } } as any);
    if (!task) throw new NotFoundException('Task not found');

    await this.prisma.task.delete({ where: { id } } as any);
    await this.auditLog.record({ userId, action: 'CONTENT_DELETED', entityType: 'Task', entityId: id, metadata: { title: task.title }, ipAddress: ip, userAgent: ua });
    return { success: true };
  }

  async getAchievements() {
    return this.prisma.achievement.findMany();
  }

  async createAchievement(userId: string, data: any, ip?: string, ua?: string) {
    const created = await this.prisma.achievement.create({ data } as any);
    await this.auditLog.record({ userId, action: 'ACHIEVEMENT_CREATED', entityType: 'Achievement', entityId: created.id, metadata: { name: created.name }, ipAddress: ip, userAgent: ua });
    return created;
  }

  async getBadges() {
    return this.prisma.badge.findMany();
  }

  async createBadge(userId: string, data: any, ip?: string, ua?: string) {
    const created = await this.prisma.badge.create({ data } as any);
    await this.auditLog.record({ userId, action: 'BADGE_CREATED', entityType: 'Badge', entityId: created.id, metadata: { name: created.name }, ipAddress: ip, userAgent: ua });
    return created;
  }
}
