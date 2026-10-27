import type { Request, Response } from 'express';
import { createApplication } from './application';

let application: ReturnType<typeof createApplication> | undefined;
export async function handler(req: Request, res: Response) {
  // Concurrent cold-start requests share initialization; subsequent requests reuse Prisma.
  application ??= createApplication().catch(error => {
    application = undefined;
    throw error;
  });
  const app = await application;
  app.getHttpAdapter().getInstance()(req, res);
}
