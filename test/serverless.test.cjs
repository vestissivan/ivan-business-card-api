const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { mkdtemp, rm } = require('node:fs/promises');
const { join } = require('node:path');
const { tmpdir } = require('node:os');

test('serverless adapter initializes a fresh DB and handles concurrent native HTTP requests', { timeout: 20000 }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'card-serverless-'));
  const child = spawn(process.execPath, ['-e', `
    const server = require('node:http').createServer(require('./api/index.js'));
    server.listen(0, '127.0.0.1', () => console.log(server.address().port));
  `], { cwd: join(__dirname, '..'), env: { ...process.env,
    DATABASE_URL: `file:${join(dir, 'fresh.db')}`, VERCEL: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', bytes => { stderr += bytes; });
  try {
    const [bytes] = await once(child.stdout, 'data');
    const port = Number(bytes.toString().trim());
    assert.ok(port > 0, stderr);
    const requests = await Promise.all(Array.from({ length: 3 }, () => fetch(`http://127.0.0.1:${port}/graphql`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ profile { name projects { name } } }' })
    })));
    for (const response of requests) {
      assert.equal(response.status, 200, stderr);
      const body = await response.json();
      assert.equal(body.errors, undefined);
      assert.equal(body.data.profile.name, 'Иван Темников');
      assert.equal(body.data.profile.projects.length, 3);
    }
    const health = await fetch(`http://127.0.0.1:${port}/health`);
    assert.deepEqual(await health.json(), { status: 'ok', database: 'ready' });
  } finally {
    child.kill();
    await once(child, 'exit');
    await rm(dir, { recursive: true, force: true });
  }
});
