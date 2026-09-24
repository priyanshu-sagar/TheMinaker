import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FastifyRequest } from 'fastify';
import { AuthUser, UserRole } from '@minaker/shared-types';

/**
 * Sets PostgreSQL RLS variable: SET app.current_tenant_id = '<uuid>'
 * Must run BEFORE any DB query in the request lifecycle.
 * Uses a dedicated connection from the pool per request.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest & { user: AuthUser }>();
    const user = request.user;

    // Super-admin bypasses tenant isolation
    if (!user || user.role === UserRole.SUPER_ADMIN) return true;

    if (user.tenantId) {
      // Use a raw query runner to set the session variable
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      try {
        await queryRunner.query(
          `SET app.current_tenant_id = '${user.tenantId}'`,
        );
      } finally {
        await queryRunner.release();
      }
      // Attach tenantId for controller use
      (request as FastifyRequest & { user: AuthUser; tenantId: string }).tenantId = user.tenantId;
    }
    return true;
  }
}
