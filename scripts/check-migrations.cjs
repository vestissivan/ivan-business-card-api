const { readFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const { strict: assert } = require('node:assert');
const result = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'),
  'migrate', 'diff', '--from-empty', '--to-schema', 'prisma/schema.prisma', '--script'],
  { encoding: 'utf8' });
if (result.status !== 0) throw new Error(result.stderr);
const normalize = value => value.replaceAll('\r\n', '\n').trim();
assert.equal(normalize(result.stdout), normalize(readFileSync('prisma/migrations/20261028000000_initial/migration.sql', 'utf8')),
  'Initial migration must match Prisma schema');
console.log('Migration matches Prisma schema.');
