import pg, { type Pool } from 'pg';
import { transaction, type Migration } from './common';
// import m0001Init from './migrations/0001-init';

const migrations: Migration[] = [
  // m0001Init,
];

export async function migrate(): Promise<void> {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    throw new Error('Please set DATABASE_URL environment variable.');
  }

  const pool = new pg.Pool({
    connectionString: databaseUrl,
  });
  try {
    await migrateInternal(pool);
  } finally {
    await pool.end();
  }
}

async function migrateInternal(pool: Pool): Promise<void> {
  await transaction(pool, async (tx) => {
    await tx.query(/* sql */`
      CREATE TABLE IF NOT EXISTS _monosaga_migrations (
        id serial PRIMARY KEY,
        name text NOT NULL UNIQUE,
        executed_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    const applieds = await tx.query(/* sql */`
      SELECT
        name
      FROM
        _monosaga_migrations
    `);
    const appliedNameSet = new Set(applieds.rows.map(r => r.name));
    for (const migration of migrations) {
      if (appliedNameSet.has(migration.name)) {
        continue;
      }

      await migration.up(tx);

      await tx.query(/* sql */`
        INSERT INTO _monosaga_migrations
          (name)
        VALUES
          (${migration.name})
      `);
    }
  });
}
