import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AuthUser, UserRole } from '@minaker/shared-types';

/**
 * Attaches the JWT tenant id to the request.
 * Row-level security is applied with SET LOCAL inside withTenant(),
 * in the same transaction as the query.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest & { user: AuthUser }>();
    const user = request.user;

    if (!user || user.role === UserRole.SUPER_ADMIN) return true;

    if (user.tenantId) {
      (request as FastifyRequest & { user: AuthUser; tenantId: string }).tenantId = user.tenantId;
    }
    return true;
  }
}
