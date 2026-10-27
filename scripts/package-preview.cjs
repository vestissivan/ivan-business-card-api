// Build Output API v3: package on Linux so native SQLite matches the runtime.
const { cpSync, mkdirSync, writeFileSync, statSync } = require('node:fs');
const { join, dirname } = require('node:path');
const { nodeFileTrace } = require('@vercel/nft');
if (process.platform !== 'linux') throw new Error('Package on Linux (native SQLite binary)');
async function main() {
const out = join('.vercel', 'output');
const func = join(out, 'functions', 'index.func');
mkdirSync(func, { recursive: true });
const { fileList } = await nodeFileTrace(['api/index.js'], { base: process.cwd() });
let size = 0;
for (const file of fileList) {
  mkdirSync(dirname(join(func, file)), { recursive: true });
  cpSync(file, join(func, file), { dereference: true });
  size += statSync(file).size;
}
cpSync('dist/database/migrations', join(func, 'dist/database/migrations'), { recursive: true });
if (size > 200 * 1024 * 1024) throw new Error('Function exceeds the review demo size budget');
writeFileSync(join(func, '.vc-config.json'), JSON.stringify({
  runtime: 'nodejs24.x', handler: 'api/index.js', launcherType: 'Nodejs',
  shouldAddHelpers: true, maxDuration: 30,
}));
writeFileSync(join(out, 'config.json'), JSON.stringify({
  version: 3, routes: [{ src: '/(.*)', dest: '/index' }],
}));
console.log(`Linux function packaged: ${fileList.size} traced files, ${(size / 1024 / 1024).toFixed(1)} MiB.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
