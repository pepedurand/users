import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { of } from 'rxjs';
import { HttpStatus } from '@nestjs/common';
import * as sinon from 'sinon';
import { axiosResponse } from '../test/axios-response.helper';
import { getModelToken } from '@nestjs/mongoose';

describe('Users Service', () => {
  let userService: UsersService;
  const httpService = sinon.createStubInstance(HttpService);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: HttpService, useValue: httpService },
        { provide: getModelToken('image'), useValue: {} },
        { provide: getModelToken('user'), useValue: {} },
        UsersService,
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
  });

  it('should return a user with the given id', async () => {
    const userId = '1';
    const expectedUser = {
      id: 11,
      email: 'george.edwards@reqres.in',
      first_name: 'George',
      last_name: 'Edwards',
      avatar: 'https://reqres.in/img/faces/11-image.jpg',
    };

    const response = axiosResponse(HttpStatus.OK, { data: expectedUser }, 'Ok');

    httpService.get
      .withArgs(`https://reqres.in/api/users/${userId}`)
      .returns(of(response));

    const user = await userService.findOne(userId);
    expect(user).toEqual(expectedUser);
  });
});
