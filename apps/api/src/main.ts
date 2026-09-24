import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable Shutdown Hooks for Graceful Shutdown
  app.enableShutdownHooks();

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  const webUrl = process.env.WEB_URL || 'http://localhost:3000';
  app.enableCors({
    origin: [webUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });

  // Global API Prefix
  app.setGlobalPrefix('api');

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`CyberLab API is running on: http://localhost:${port}/api`);
}
bootstrap();
