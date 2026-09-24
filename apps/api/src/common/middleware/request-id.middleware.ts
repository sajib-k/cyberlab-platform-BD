import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4, validate as isUuid } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const headerName = 'x-request-id';
    let requestId = req.headers[headerName];

    if (!requestId || typeof requestId !== 'string' || !isUuid(requestId)) {
      requestId = uuidv4();
    }

    req.headers[headerName] = requestId;
    res.setHeader(headerName, requestId);

    next();
  }
}
