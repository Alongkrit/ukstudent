import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  role: 'student' | 'expert' | 'admin';
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET') as string,
    });
  }

  // Return value is attached to request.user (see CurrentUser decorator).
  // TODO(SEC-1): optionally re-check user.status !== 'suspended'|'banned' here.
  async validate(payload: JwtPayload) {
    return { id: payload.sub, role: payload.role, email: payload.email };
  }
}
