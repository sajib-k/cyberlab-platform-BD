import { Controller, Get, Post, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('courses')
  async findAll() {
    return this.courseService.findAll(false);
  }

  @Get('courses/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.courseService.findBySlug(slug);
  }

  @Get('learning-paths/:pathSlug/courses')
  async findByLearningPathSlug(@Param('pathSlug') pathSlug: string) {
    return this.courseService.findByLearningPathSlug(pathSlug);
  }

  @Post('courses')
  @UseGuards(AuthGuard)
  async create(@Req() req: any, @Body() dto: CreateCourseDto) {
    const user = req.user;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'CONTENT_MANAGER')) {
      throw new ForbiddenException('Only admin or content managers can create courses');
    }
    return this.courseService.create(dto);
  }
}
