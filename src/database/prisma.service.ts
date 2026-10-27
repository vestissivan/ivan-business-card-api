import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client';
import { databasePath } from './database-config';
import { migrate } from './migrate';
import { seed } from './seed';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const path = databasePath();
    migrate(path);
    super({ adapter: new PrismaBetterSqlite3({ url: `file:${path.replaceAll('\\', '/')}` }),
      log: [{ emit: 'event', level: 'query' }] });
  }
  async onModuleInit(): Promise<void> {
    await this.$connect();
    await seed(this);
  }
  async onModuleDestroy(): Promise<void> { await this.$disconnect(); }
}
