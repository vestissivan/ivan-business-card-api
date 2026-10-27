import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

export function databasePath(): string {
  const url = process.env.DATABASE_URL;
  if (!url) return process.env.VERCEL
    ? join(tmpdir(), 'ivan-business-card', 'profile.db')
    : resolve('data', 'profile.db');
  if (!url.startsWith('file:')) throw new Error('DATABASE_URL must use SQLite file:');
  if (url.startsWith('file://')) return fileURLToPath(url);
  return resolve(url.slice(5));
}
