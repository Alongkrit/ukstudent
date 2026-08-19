import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Verifies the Bearer access token (mobile: header; web: read from the
// in-memory access token attached by the frontend, never a cookie —
// see Security & Access Document, Section 3.2.1).
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
