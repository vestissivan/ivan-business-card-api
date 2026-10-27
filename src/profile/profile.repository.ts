import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PROFILE_ID } from '../database/seed';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}
  find() {
    return this.prisma.profile.findUniqueOrThrow({
      where: { id: PROFILE_ID },
      include: {
        links: { orderBy: { sortOrder: 'asc' } },
        skills: { orderBy: { sortOrder: 'asc' } },
        experience: { orderBy: { sortOrder: 'asc' } },
        projects: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }
}
