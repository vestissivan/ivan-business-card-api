const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const request = require('supertest');
const { createApplication } = require('../dist/application');
const { PrismaService } = require('../dist/database/prisma.service');
const { ProfileService } = require('../dist/profile/profile.service');
const { ContextIdFactory } = require('@nestjs/core');
const Database = require('better-sqlite3');

let app, dir, api;
before(async () => {
  dir = await mkdtemp(join(tmpdir(), 'business-card-'));
  process.env.DATABASE_URL = `file:${join(dir, 'fresh', 'profile.db')}`;
  app = await createApplication();
  api = request(app.getHttpServer());
});
after(async () => {
  if (app) await app.close();
  if (dir) await rm(dir, { recursive: true, force: true });
});

test('fresh start serves the requested profile and nested data', async () => {
  const result = await api.post('/graphql').send({ query: `{
    profile { name description links { label url } skills { name }
      experience { company position period startDate endDate achievements }
      projects { name url description } }
  }` });
  assert.equal(result.status, 200);
  assert.equal(result.body.errors, undefined);
  const p = result.body.data.profile;
  assert.equal(p.name, 'Иван Темников');
  assert.ok(p.skills.length >= 5);
  assert.equal(p.experience[0].company, 'Самостоятельные проекты');
  assert.equal(p.experience[0].startDate, null);
  assert.ok(p.projects.some(p => p.url === 'https://torq-works.vercel.app'));
  assert.ok(p.links.every(l => /^https:\/\//.test(l.url)));
});

test('aliases, fragments and directives return the same real profile', async () => {
  const result = await api.post('/graphql').send({
    query: `query Card($withSkills: Boolean!) {
      first: profile { ...Basics skills @include(if: $withSkills) { name } }
      second: profile { ...Basics }
    } fragment Basics on Profile { name projects { name } }`,
    variables: { withSkills: false }
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.errors, undefined);
  assert.deepEqual(result.body.data.first, result.body.data.second);
  assert.equal(result.body.data.first.skills, undefined);
});

test('unknown GraphQL fields are rejected before execution', async () => {
  const result = await api.post('/graphql').send({ query: '{ profile { password } }' });
  assert.equal(result.status, 400);
  assert.match(result.body.errors[0].message, /Cannot query field/);
});

test('public API does not expose mutations', async () => {
  const result = await api.post('/graphql').send({ query: 'mutation { deleteProfile }' });
  assert.ok([200, 400].includes(result.status));
  assert.ok(result.body.errors?.length);
  assert.match(result.body.errors[0].message, /mutation/i);
});

test('health checks the ready database', async () => {
  const result = await api.get('/health');
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { status: 'ok', database: 'ready' });
});

test('GraphQL HTML landing page offers the Apollo Sandbox', async () => {
  const result = await api.get('/graphql').set('Accept', 'text/html');
  assert.equal(result.status, 200);
  assert.match(result.text, /sandbox/i);
});

test('a request reuses its profile instead of loading relations twice', async () => {
  const prisma = app.get(PrismaService);
  let selects = 0;
  const count = event => { if (/^SELECT/i.test(event.query)) selects++; };
  prisma.$on('query', count);
  const service = await app.resolve(ProfileService, ContextIdFactory.create());
  await service.getProfile();
  const first = selects;
  assert.ok(first > 0 && first <= 5, `expected at most 5 SELECTs, got ${first}`);
  await service.getProfile();
  assert.equal(selects, first, 'second access in one request must reuse the resolved profile');
});

test('nested data and aliases keep bounded SQL query count as projects grow', async () => {
  const prisma = app.get(PrismaService);
  let selects = 0;
  prisma.$on('query', event => { if (/^SELECT/i.test(event.query)) selects++; });
  await prisma.project.createMany({ data: Array.from({ length: 80 }, (_, n) => ({
    id: `fixture-${n}`, profileId: 'ivan-temnikov', sortOrder: n + 100,
    name: `Test fixture ${n}`, url: 'https://example.com', description: 'Test-only data'
  })) });
  selects = 0;
  const result = await api.post('/graphql').send({ query: `{
    one: profile { projects { name } skills { name } experience { company } }
    two: profile { projects { name } }
  }` });
  assert.equal(result.body.errors, undefined);
  assert.equal(result.body.data.one.projects.length, 83);
  assert.ok(selects <= 5, `nested query used ${selects} SELECTs`);
  await prisma.project.deleteMany({ where: { id: { startsWith: 'fixture-' } } });
});

test('restart is idempotent and preserves one migration and stable seed IDs', async () => {
  const prisma = app.get(PrismaService);
  const beforeIds = (await prisma.project.findMany({ orderBy: { id: 'asc' } })).map(p => p.id);
  await app.close();
  app = await createApplication();
  api = request(app.getHttpServer());
  const restarted = app.get(PrismaService);
  const afterIds = (await restarted.project.findMany({ orderBy: { id: 'asc' } })).map(p => p.id);
  assert.deepEqual(afterIds, beforeIds);
  assert.equal(await restarted.profile.count(), 1);
  assert.equal(await restarted.experience.count(), 1);
  assert.equal(await restarted.skill.count(), 10);
  const ledger = await restarted.$queryRawUnsafe('SELECT * FROM __app_migrations');
  assert.equal(ledger.length, 1);
});

test('changed applied migration is refused rather than silently accepted', () => {
  const { migrate } = require('../dist/database/migrate');
  const dbPath = join(dir, 'tampered.db');
  migrate(dbPath);
  const db = new Database(dbPath);
  db.prepare('UPDATE __app_migrations SET checksum = ?').run('changed');
  db.close();
  assert.throws(() => migrate(dbPath), /Applied migration changed/);
});
