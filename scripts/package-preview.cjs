// Build Output API v3: package on Linux so native SQLite matches the runtime.
const { cpSync, mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
if (process.platform !== 'linux') throw new Error('Package on Linux (native SQLite binary)');
const out = join('.vercel', 'output');
const func = join(out, 'functions', 'index.func');
mkdirSync(func, { recursive: true });
cpSync('dist', join(func, 'dist'), { recursive: true });
cpSync('node_modules', join(func, 'node_modules'), { recursive: true, dereference: true });
writeFileSync(join(func, 'index.js'), "module.exports = require('./dist/serverless.js').handler;\n");
writeFileSync(join(func, '.vc-config.json'), JSON.stringify({
  runtime: 'nodejs24.x', handler: 'index.js', launcherType: 'Nodejs',
  shouldAddHelpers: true, maxDuration: 30,
}));
writeFileSync(join(out, 'config.json'), JSON.stringify({
  version: 3, routes: [{ src: '/(.*)', dest: '/index' }],
}));
console.log('Linux function packaged with migrations and production dependencies.');
