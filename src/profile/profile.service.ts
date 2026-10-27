import { Injectable, Scope } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { Profile } from './profile.types';

@Injectable({ scope: Scope.REQUEST })
export class ProfileService {
  private profile?: Promise<Profile>;
  constructor(private readonly repository: ProfileRepository) {}
  getProfile(): Promise<Profile> {
    return this.profile ??= this.loadProfile();
  }
  private async loadProfile(): Promise<Profile> {
    const row = await this.repository.find();
    return { ...row, experience: row.experience.map(item => ({
      ...item, achievements: JSON.parse(item.achievementsJson) as string[],
    })) };
  }
}
