import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { LearningPathModule } from './modules/learning-paths/learning-path.module';
import { CourseModule } from './modules/courses/course.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ProfileModule,
    LearningPathModule,
    CourseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
