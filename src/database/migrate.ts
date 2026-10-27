import Database from 'better-sqlite3';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

export function migrate(path: string): void {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  try {
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 10000');
    // Startup owns migration execution in all environments, including serverless.
    // A separate ledger avoids pretending this is Prisma CLI's internal format.
    db.exec(`CREATE TABLE IF NOT EXISTS __app_migrations (
      name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TEXT NOT NULL
    )`);
    const migrations = join(__dirname, 'migrations');
    db.transaction(() => {
      for (const name of readdirSync(migrations, { withFileTypes: true })
        .filter(entry => entry.isDirectory()).map(entry => entry.name).sort()) {
        const sql = readFileSync(join(migrations, name, 'migration.sql'), 'utf8');
        const checksum = createHash('sha256').update(sql).digest('hex');
        const applied = db.prepare('SELECT checksum FROM __app_migrations WHERE name = ?')
          .get(name) as { checksum: string } | undefined;
        if (applied) {
          if (applied.checksum !== checksum) throw new Error(`Applied migration changed: ${name}`);
          continue;
        }
        db.exec(sql);
        db.prepare('INSERT INTO __app_migrations (name, checksum, applied_at) VALUES (?, ?, ?)')
          .run(name, checksum, new Date().toISOString());
      }
    }).immediate();
  } finally {
    db.close();
  }
}
