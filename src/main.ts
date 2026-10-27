import { createApplication } from './application';

async function bootstrap() {
  const app = await createApplication();
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
}
bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
