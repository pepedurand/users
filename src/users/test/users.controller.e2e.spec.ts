import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from '../users.module';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import * as sinon from 'sinon';
import { Model } from 'mongoose';
import { ConfigModule } from '@nestjs/config';
import * as fs from 'fs';
import { User } from '../interface/user.interface';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { axiosResponse } from './axios-response.helper';
import { Image } from '../interface/image.interface';
import axios from 'axios';

const mockUserData = {
  email: 'george.edwards@reqres.in',
  first_name: 'George',
  last_name: 'Edwards',
  avatar: 'https://reqres.in/img/faces/11-image.jpg',
};

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  const imageModel = sinon.createStubInstance(Model<Image>);
  const userModel = sinon.createStubInstance(Model<User>);
  const httpService = sinon.createStubInstance(HttpService);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        MongooseModule.forRoot(
          `mongodb+srv://admin:admin@users.nff7kzb.mongodb.net/?retryWrites=true&w=majority`,
        ),
        ConfigModule.forRoot({
          envFilePath: ['.env'],
        }),
      ],
    })
      .overrideProvider(getModelToken('user'))
      .useValue(userModel)
      .overrideProvider(HttpService)
      .useValue(httpService)
      .overrideProvider(getModelToken('image'))
      .useValue(imageModel)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/users (POST)', async () => {
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.create = jest.fn().mockResolvedValue(mockUserData);

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send(mockUserData)
      .expect(HttpStatus.CREATED);
    expect(response.body.email).toBe(mockUserData.email);
  });
  it('/api/users/:id (GET)', async () => {
    httpService.get
      .withArgs(`https://reqres.in/api/users/${123}`)
      .returns(of(axiosResponse(HttpStatus.OK, { data: mockUserData }, 'Ok')));

    const response = await request(app.getHttpServer())
      .get(`/api/users/${123}`)
      .expect(HttpStatus.OK);
    expect(response.body).toEqual(mockUserData);
  });
  it('/api/users/:id/avatar (GET)', async () => {
    const avatarUrl = 'https://example.com/avatar.jpg';
    const avatarBase64 = 'image-data-as-base64-string';
    const imagePath = `./src/assets/image${1}.txt`;

    jest.mock('axios');
    jest.spyOn(axios, 'get').mockResolvedValue({
      data: Buffer.from(avatarBase64, 'base64'),
    });
    jest.mock('fs');

    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    jest.spyOn(fs, 'readFileSync').mockReturnValue(avatarBase64);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

    userModel.findOne = jest.fn().mockResolvedValue({
      avatar: avatarUrl,
    });
    imageModel.findOne = jest.fn().mockResolvedValue({ userId: '1' });
    imageModel.create = jest
      .fn()
      .mockResolvedValue({ userId: '1', file: imagePath });

    const response = await request(app.getHttpServer())
      .get(`/api/users/${1}/avatar`)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({ userId: '1', file: imagePath });
  });
  it('/api/users/:id/avatar (DEL)', async () => {
    imageModel.deleteOne = jest.fn().mockResolvedValue({ n: 1 });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

    const response = await request(app.getHttpServer())
      .delete(`/api/users/${1}/avatar`)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({ n: 1 });
  });
});
