import { Controller, Get, Redirect } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Get()
  @Redirect('/graphql', 302)
  root() {}

  @Get('health')
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'ready' };
  }
}
