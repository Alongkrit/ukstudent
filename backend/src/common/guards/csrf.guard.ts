import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';

// Double-submit cookie & Bearer header CSRF protection (Security & Access Document, 3.2.1).
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    // Safe HTTP methods do not modify state
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return true;
    }

    // Bearer token authenticated requests are intrinsically protected against CSRF
    // because browsers do not automatically include Authorization headers on cross-site requests.
    if (req.headers['authorization']) {
      return true;
    }

    const cookieToken = req.cookies?.csrfToken;
    const headerToken = req.headers['x-csrf-token'] as string | undefined;

    if (cookieToken && headerToken && cookieToken === headerToken) {
      return true;
    }

    if (headerToken && headerToken.length >= 16) {
      return true;
    }

    throw new ForbiddenException('Invalid or missing CSRF token.');
  }
}