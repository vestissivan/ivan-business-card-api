import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProfessionalLink {
  @Field() label!: string;
  @Field() url!: string;
}
@ObjectType()
export class Skill {
  @Field() name!: string;
}
@ObjectType()
export class Experience {
  @Field() company!: string;
  @Field() position!: string;
  @Field() period!: string;
  @Field(() => String, { nullable: true }) startDate!: string | null;
  @Field(() => String, { nullable: true }) endDate!: string | null;
  @Field(() => [String]) achievements!: string[];
}
@ObjectType()
export class Project {
  @Field() name!: string;
  @Field() url!: string;
  @Field() description!: string;
}
@ObjectType()
export class Profile {
  @Field() name!: string;
  @Field() description!: string;
  @Field(() => [ProfessionalLink]) links!: ProfessionalLink[];
  @Field(() => [Skill]) skills!: Skill[];
  @Field(() => [Experience]) experience!: Experience[];
  @Field(() => [Project]) projects!: Project[];
}
