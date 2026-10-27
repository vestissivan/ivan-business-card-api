import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { PrismaService } from './database/prisma.service';
import { ProfileRepository } from './profile/profile.repository';
import { ProfileService } from './profile/profile.service';
import { ProfileResolver } from './profile/profile.resolver';
import { HealthController } from './health.controller';

@Module({
  imports: [GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    path: '/graphql',
    autoSchemaFile: true,
    sortSchema: true,
    introspection: true,
    includeStacktraceInErrorResponses: false,
    playground: false,
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true,
      document: 'query BusinessCard { profile { name description links { label url } skills { name } experience { company position period achievements } projects { name url } } }',
      includeCookies: false,
    })],
  })],
  controllers: [HealthController],
  providers: [PrismaService, ProfileRepository, ProfileService, ProfileResolver],
})
class AppModule {}

export async function createApplication() {
  const app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.enableCors({ origin: ['https://studio.apollographql.com', 'https://sandbox.embed.apollographql.com'], credentials: false });
  await app.init();
  return app;
}
