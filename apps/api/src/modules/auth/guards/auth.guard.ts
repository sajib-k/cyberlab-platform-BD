import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const rawToken = request.cookies?.['cyberlab_session'];

    if (!rawToken) {
      throw new UnauthorizedException('Authentication token not found');
    }

    const user = await this.authService.validateSession(rawToken);

    if (!user) {
      throw new UnauthorizedException('Session is invalid or expired');
    }

    // Attach user to request object
    request.user = user;
    return true;
  }
}
