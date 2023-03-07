import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';

let module: TestingModule;
let app: INestApplication;

beforeAll(async () => {
  module = await Test.createTestingModule({
    imports: [
      MongooseModule.forRootAsync({
        imports: [UsersModule],
      }),
    ],
  }).compile();

  app = module.createNestApplication();

  await app.init();
}, 40000);

describe('[findIntentions] GET /intentions', () => {
  it('Must return the reseller data from local db with geraId param', async () => {
    // const response = await request(app.getHttpServer());
  });
});
