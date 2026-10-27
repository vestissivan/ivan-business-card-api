import { Query, Resolver } from '@nestjs/graphql';
import { ProfileService } from './profile.service';
import { Profile } from './profile.types';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly service: ProfileService) {}
  @Query(() => Profile)
  profile(): Promise<Profile> { return this.service.getProfile(); }
}
