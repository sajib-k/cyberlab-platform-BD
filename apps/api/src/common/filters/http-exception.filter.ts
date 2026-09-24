import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resResponse = exception.getResponse();
      
      if (typeof resResponse === 'string') {
        message = resResponse;
      } else if (typeof resResponse === 'object' && resResponse !== null) {
        const errObj = resResponse as any;
        message = errObj.message || message;
        error = errObj.error || error;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (process.env.NODE_ENV === 'production' && status === HttpStatus.INTERNAL_SERVER_ERROR) {
      message = 'Internal server error';
    }

    this.logger.error(
      `[Path: ${request.url}] [Status: ${status}] [Error: ${JSON.stringify(message)}]`,
      exception instanceof Error ? exception.stack : ''
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.headers['x-request-id'] || null,
    });
  }
}
