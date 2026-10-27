const assert = require('node:assert/strict');
async function main() {
  const base = process.env.API_URL || 'http://127.0.0.1:3000';
  const health = await fetch(`${base}/health`);
  assert.equal(health.status, 200);
  const response = await fetch(`${base}/graphql`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: '{ profile { name skills { name } experience { company position } projects { name url } } }' })
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.errors, undefined);
  assert.equal(body.data.profile.name, 'Иван Темников');
  assert.equal(body.data.profile.projects.length, 3);
  assert.equal(body.data.profile.skills.length, 10);
  console.log('Fresh startup / GraphQL smoke test passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
