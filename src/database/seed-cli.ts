import { PrismaService } from './prisma.service';

async function main() {
  const prisma = new PrismaService();
  try { await prisma.onModuleInit(); }
  finally { await prisma.onModuleDestroy(); }
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
