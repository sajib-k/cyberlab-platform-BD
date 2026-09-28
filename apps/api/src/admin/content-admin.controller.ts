import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ContentAdminService } from './content-admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentAdminController {
  constructor(private readonly contentService: ContentAdminService) {}

  @Get('learning-paths')
  @Roles('ADMIN', 'INSTRUCTOR')
  async getLearningPaths(@Query('page') page = '1', @Query('limit') limit = '20', @Query('published') published?: string, @Query('difficulty') difficulty?: string) {
    const pubBool = published === 'true' ? true : published === 'false' ? false : undefined;
    return this.contentService.getLearningPaths(parseInt(page, 10), parseInt(limit, 10), { published: pubBool, difficulty });
  }

  @Get('learning-paths/:id')
  @Roles('ADMIN', 'INSTRUCTOR')
  async getLearningPathById(@Param('id') id: string) {
    return this.contentService.getLearningPathById(id);
  }

  @Post('learning-paths')
  @Roles('ADMIN', 'INSTRUCTOR')
  async createLearningPath(@Req() req: any, @Body() data: any) {
    return this.contentService.createLearningPath(req.user.id, data, req.ip, req.headers['user-agent']);
  }

  @Patch('learning-paths/:id')
  @Roles('ADMIN', 'INSTRUCTOR')
  async updateLearningPath(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.contentService.updateLearningPath(req.user.id, id, data, req.ip, req.headers['user-agent']);
  }

  @Delete('learning-paths/:id')
  @Roles('ADMIN')
  async deleteLearningPath(@Req() req: any, @Param('id') id: string) {
    return this.contentService.deleteLearningPath(req.user.id, id, req.ip, req.headers['user-agent']);
  }

  @Get('courses')
  @Roles('ADMIN', 'INSTRUCTOR')
  async getCourses(@Query('page') page = '1', @Query('limit') limit = '20', @Query('learningPathId') learningPathId?: string, @Query('published') published?: string) {
    const pubBool = published === 'true' ? true : published === 'false' ? false : undefined;
    return this.contentService.getCourses(parseInt(page, 10), parseInt(limit, 10), { learningPathId, published: pubBool });
  }

  @Post('courses')
  @Roles('ADMIN', 'INSTRUCTOR')
  async createCourse(@Req() req: any, @Body() data: any) {
    return this.contentService.createCourse(req.user.id, data, req.ip, req.headers['user-agent']);
  }

  @Patch('courses/:id')
  @Roles('ADMIN', 'INSTRUCTOR')
  async updateCourse(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.contentService.updateCourse(req.user.id, id, data, req.ip, req.headers['user-agent']);
  }

  @Delete('courses/:id')
  @Roles('ADMIN')
  async deleteCourse(@Req() req: any, @Param('id') id: string) {
    return this.contentService.deleteCourse(req.user.id, id, req.ip, req.headers['user-agent']);
  }

  @Get('rooms')
  @Roles('ADMIN', 'INSTRUCTOR')
  async getRooms(@Query('page') page = '1', @Query('limit') limit = '20', @Query('courseId') courseId?: string, @Query('published') published?: string) {
    const pubBool = published === 'true' ? true : published === 'false' ? false : undefined;
    return this.contentService.getRooms(parseInt(page, 10), parseInt(limit, 10), { courseId, published: pubBool });
  }

  @Post('rooms')
  @Roles('ADMIN', 'INSTRUCTOR')
  async createRoom(@Req() req: any, @Body() data: any) {
    return this.contentService.createRoom(req.user.id, data, req.ip, req.headers['user-agent']);
  }

  @Patch('rooms/:id')
  @Roles('ADMIN', 'INSTRUCTOR')
  async updateRoom(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.contentService.updateRoom(req.user.id, id, data, req.ip, req.headers['user-agent']);
  }

  @Delete('rooms/:id')
  @Roles('ADMIN')
  async deleteRoom(@Req() req: any, @Param('id') id: string) {
    return this.contentService.deleteRoom(req.user.id, id, req.ip, req.headers['user-agent']);
  }

  @Get('tasks')
  @Roles('ADMIN', 'INSTRUCTOR')
  async getTasks(@Query('page') page = '1', @Query('limit') limit = '20', @Query('roomId') roomId?: string, @Query('published') published?: string) {
    const pubBool = published === 'true' ? true : published === 'false' ? false : undefined;
    return this.contentService.getTasks(parseInt(page, 10), parseInt(limit, 10), { roomId, published: pubBool });
  }

  @Post('tasks')
  @Roles('ADMIN', 'INSTRUCTOR')
  async createTask(@Req() req: any, @Body() data: any) {
    return this.contentService.createTask(req.user.id, data, req.ip, req.headers['user-agent']);
  }

  @Patch('tasks/:id')
  @Roles('ADMIN', 'INSTRUCTOR')
  async updateTask(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.contentService.updateTask(req.user.id, id, data, req.ip, req.headers['user-agent']);
  }

  @Delete('tasks/:id')
  @Roles('ADMIN')
  async deleteTask(@Req() req: any, @Param('id') id: string) {
    return this.contentService.deleteTask(req.user.id, id, req.ip, req.headers['user-agent']);
  }

  @Get('achievements')
  @Roles('ADMIN')
  async getAchievements() {
    return this.contentService.getAchievements();
  }

  @Post('achievements')
  @Roles('ADMIN')
  async createAchievement(@Req() req: any, @Body() data: any) {
    return this.contentService.createAchievement(req.user.id, data, req.ip, req.headers['user-agent']);
  }

  @Get('badges')
  @Roles('ADMIN')
  async getBadges() {
    return this.contentService.getBadges();
  }

  @Post('badges')
  @Roles('ADMIN')
  async createBadge(@Req() req: any, @Body() data: any) {
    return this.contentService.createBadge(req.user.id, data, req.ip, req.headers['user-agent']);
  }
}
