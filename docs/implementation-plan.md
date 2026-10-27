# Business card implementation plan

**Goal:** Complete the employer's read-only GraphQL assessment with verifiable source and demo.

**Architecture:** Resolver → request-scoped service → Prisma repository. Database bootstrap applies versioned SQL and idempotent transactional seed before serving requests. SQLite keeps local, Docker and serverless demo startup independent of external credentials.

1. [x] Establish an empty Nest application and contract tests. Initial run: 6 expected failures (404 routes); production code added afterwards.
2. [x] Add Prisma models, migration/bootstrap and truthful seed. Restart/row-count checks use a real temporary database.
3. [x] Implement GraphQL object types, repository, request cache, health and Sandbox. Cache test first failed with 10 SELECTs instead of 5. After request cache: all 10 tests pass.
4. [ ] Add multi-stage Docker, Docker Compose and CI smoke test. Document architecture, exact startup/query commands, truthful experience interpretation and serverless storage trade-off. Build and test cleanly before committing.
5. [ ] Publish only this assessment repository, deploy a free preview, verify visible Sandbox through the browser and submit exact links in the employer's existing HH chat. Record evidence and status without accepting contract/monitoring terms.

The user authorized independent execution of assignments and routine implementation choices. Work proceeds in this dedicated new repository, on assessment branch, without a separate design-approval stop.
