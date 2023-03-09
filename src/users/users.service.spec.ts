import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { of } from 'rxjs';
import { HttpStatus } from '@nestjs/common';
import * as sinon from 'sinon';
import { axiosResponse } from '../test/axios-response.helper';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interface/user.interface';
import { Image } from './interface/image.interface';
import axios from 'axios';
import * as fs from 'fs';
// import { mocked } from 'ts-jest/utils'

const userId = '1';
const expectedUser = {
  id: 11,
  email: 'george.edwards@reqres.in',
  first_name: 'George',
  last_name: 'Edwards',
  avatar: 'https://reqres.in/img/faces/11-image.jpg',
};

const _id = '123';
const avatarUrl = 'https://example.com/avatar.jpg';
const avatarBase64 = 'image-data-as-base64-string';
const imagePath = `./src/assets/image${_id}.txt`;

jest.mock('axios');
jest.mock('fs');

describe('Users Service', () => {
  let userService: UsersService;
  let userModel: Model<User>;

  const httpService = sinon.createStubInstance(HttpService);
  const imageModel = sinon.createStubInstance(Model<Image>);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: HttpService, useValue: httpService },
        {
          provide: getModelToken('image'),
          useValue: imageModel,
        },
        { provide: getModelToken('user'), useValue: {} },
        UsersService,
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken('user'));

    jest.resetAllMocks();
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    jest.spyOn(fs, 'readFileSync').mockReturnValue(avatarBase64);

    jest.spyOn(axios, 'get').mockResolvedValue({
      data: Buffer.from(avatarBase64, 'base64'),
    });

    userModel.findOne = jest.fn().mockResolvedValue({
      avatar: avatarUrl,
    });

    imageModel.findOne = jest.fn().mockResolvedValue({
      userId: _id,
      file: imagePath,
    });
  });

  it('should return a user with the given id', async () => {
    const response = axiosResponse(HttpStatus.OK, { data: expectedUser }, 'Ok');

    httpService.get
      .withArgs(`https://reqres.in/api/users/${userId}`)
      .returns(of(response));

    const user = await userService.findOne(userId);
    expect(user).toEqual(expectedUser);
  });
  it('deve retornar o avatar do usuário', async () => {
    const result = await userService.findUserAvatar(_id);
    expect(result.userId).toBe(_id);
    expect(result.file).toBe(imagePath);
    expect(userModel.findOne).toHaveBeenCalledWith({ _id });
    expect(imageModel.findOne).toHaveBeenCalledWith({ userId: _id });
  });
});
