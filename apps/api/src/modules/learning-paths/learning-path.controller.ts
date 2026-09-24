import { Controller, Get, Post, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { LearningPathService } from './learning-path.service';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('learning-paths')
export class LearningPathController {
  constructor(private readonly learningPathService: LearningPathService) {}

  @Get()
  async findAll() {
    return this.learningPathService.findAll(false);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.learningPathService.findBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Req() req: any, @Body() dto: CreateLearningPathDto) {
    const user = req.user;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'CONTENT_MANAGER')) {
      throw new ForbiddenException('Only admin or content managers can create learning paths');
    }
    return this.learningPathService.create(dto);
  }
}
