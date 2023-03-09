import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { of } from 'rxjs';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import * as sinon from 'sinon';
import { axiosResponse } from '../test/axios-response.helper';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interface/user.interface';
import { Image } from './interface/image.interface';
import axios from 'axios';
import * as fs from 'fs';

const userId = '1';
const expectedUser = {
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

  const httpService = sinon.createStubInstance(HttpService);
  const imageModel = sinon.createStubInstance(Model<Image>);
  const userModel = sinon.createStubInstance(Model<User>);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: HttpService, useValue: httpService },
        {
          provide: getModelToken('image'),
          useValue: imageModel,
        },
        { provide: getModelToken('user'), useValue: userModel },
        UsersService,
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);

    jest.resetAllMocks();
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    jest.spyOn(fs, 'readFileSync').mockReturnValue(avatarBase64);

    jest.spyOn(axios, 'get').mockResolvedValue({
      data: Buffer.from(avatarBase64, 'base64'),
    });
    userModel.findOne = jest.fn().mockResolvedValue({
      avatar: avatarUrl,
    });
  });

  describe('create', () => {
    it('should create a user if email is not taken', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(null);
      userModel.create = jest.fn().mockResolvedValue(expectedUser);
      const result = await userService.create(expectedUser);
      expect(result.email).toBe(expectedUser.email);
      expect(userModel.findOne).toHaveBeenCalledTimes(1);
      expect(userModel.create).toHaveBeenCalledTimes(1);
    });
    it('should throw a bad request excpetion if email is taken', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(expectedUser.email);
      userModel.create = jest.fn().mockResolvedValue(expectedUser);
      await expect(userService.create(expectedUser)).rejects.toThrowError(
        new BadRequestException(
          `User with e-mail ${expectedUser.email} already registered`,
        ),
      );
      expect(userModel.findOne).toHaveBeenCalledTimes(1);
      expect(userModel.create).toHaveBeenCalledTimes(0);
    });
  });

  describe('findOne', () => {
    it('should return a user with the given id', async () => {
      const response = axiosResponse(
        HttpStatus.OK,
        { data: expectedUser },
        'Ok',
      );

      httpService.get
        .withArgs(`https://reqres.in/api/users/${userId}`)
        .returns(of(response));

      const user = await userService.findOne(userId);
      expect(user).toEqual(expectedUser);
    });
  });

  describe('findUserAvatar', () => {
    it('should return the saved image if it image exists', async () => {
      imageModel.findOne = jest.fn().mockResolvedValue({
        userId: _id,
        file: imagePath,
      });
      const result = await userService.findUserAvatar(_id);

      expect(result.userId).toBe(_id);
      expect(result.file).toBe(imagePath);
      expect(userModel.findOne).toHaveBeenCalledWith({ _id });
      expect(imageModel.findOne).toHaveBeenCalledWith({ userId: _id });
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
    it('should save the image if image not exists', async () => {
      jest.mocked(fs.existsSync).mockReturnValueOnce(false);
      imageModel.findOne = jest.fn().mockResolvedValue({ userId: _id });
      imageModel.create = jest
        .fn()
        .mockResolvedValue({ userId: _id, file: imagePath });

      const result = await userService.findUserAvatar(_id);

      expect(result.userId).toBe(_id);
      expect(result.file).toBe(imagePath);
      expect(userModel.findOne).toHaveBeenCalledWith({ _id });
      expect(axios.get).toHaveBeenCalledWith(avatarUrl, {
        responseType: 'arraybuffer',
      });
      expect(fs.existsSync).toHaveBeenCalledWith(imagePath);
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove item from fs if exists and db entry', async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
      imageModel.deleteOne = jest.fn().mockResolvedValue({ n: 1 });
      await userService.remove(userId);
      expect(fs.unlinkSync).toHaveBeenCalledTimes(1);
      expect(imageModel.deleteOne).toHaveBeenCalledWith({ userId });
    });
  });
});
