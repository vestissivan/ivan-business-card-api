# Technical assessment: digital business card

The employer requests a small read-only API, not a new product. The implementation uses NestJS 12, TypeScript, Prisma 7, GraphQL/Apollo Sandbox, SQLite and Docker. SQLite keeps the sample self-contained and avoids requiring a paid database account. The assignment does not require PostgreSQL. A separate database server would be appropriate for a mutable multi-instance product; here the dataset is public, small and read-only.

The GraphQL resolver delegates to a request-scoped service, which memoizes the profile within that request. The repository loads the profile and its three ordered relations in a bounded number of queries. This avoids a resolver query for each nested row and repeats across GraphQL aliases. Prisma/database startup stays outside the presentation layer.

An ordered, checksum-verified SQL migration is applied automatically under a SQLite transaction before the Prisma seed transaction. The migration is generated from the Prisma schema. Initialization is idempotent. The database path is configurable; a local container persists it in a volume, while a serverless demo uses /tmp and restores the same seed after cold starts. This is sufficient for this explicitly read-only API.

Only verified public professional information is seeded. The experience entry is labelled independent project work, not employment at an invented company. The confirmed duration is two years of automation; exact calendar dates are unknown and remain null. No employers, dates, commercial Python tenure or product growth figures are fabricated.

Acceptance: fresh directory starts with complete nested data; repeat initialization preserves IDs and row counts; GraphQL aliases/fragments work; nested query count stays bounded when data grows; mutations are unavailable; invalid fields fail validation; health and Sandbox are usable; Docker has a clean-build smoke test. Local tests precede implementation and publication. No work-monitoring conditions or contracts are accepted by delivering a technical demonstration.
