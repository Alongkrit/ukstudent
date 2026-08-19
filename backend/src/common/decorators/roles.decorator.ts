import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

// Usage: @Roles('admin') or @Roles('student', 'expert')
// Enforces the RBAC matrix in the Security & Access Document, Section 2.2.
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
