const { cpSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');
// Keep migrations alongside compiled code so packaging does not depend on CWD.
mkdirSync(join('dist', 'database', 'migrations'), { recursive: true });
cpSync('prisma/migrations', join('dist', 'database', 'migrations'), { recursive: true });
