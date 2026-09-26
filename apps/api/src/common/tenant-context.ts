import { DataSource, EntityManager } from 'typeorm';

/**
 * Runs work in one transaction after SET LOCAL via set_config(..., true).
 * The third argument makes the setting local to this transaction, which is
 * what PgBouncer transaction pooling allows. A session-level SET on another
 * pooled connection does not apply to the query.
 */
export function withTenant<T>(
  dataSource: DataSource,
  tenantId: string,
  run: (manager: EntityManager) => Promise<T>,
): Promise<T> {
  return dataSource.transaction(async (manager) => {
    await manager.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [tenantId]);
    return run(manager);
  });
}
