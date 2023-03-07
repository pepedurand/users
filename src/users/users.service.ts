import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Model } from 'mongoose';
import { User } from './interface/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { existsSync, writeFileSync } from 'fs';
import axios from 'axios';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('user') private readonly userModel: Model<User>,
    private readonly httpService: HttpService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const { email } = createUserDto;

    const foundUser = await this.userModel.findOne({
      email,
    });

    if (foundUser) {
      throw new BadRequestException(
        `User with e-mail ${email} already registered`,
      );
    }

    const createdUser = new this.userModel(createUserDto);
    return await createdUser.save();
  }

  async findOne(id: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`https://reqres.in/api/users/${id}`),
      );

      return data.data;
    } catch (error) {
      throw new HttpException(error, error.status);
    }
  }

  async findUserAvatar(_id: string) {
    const { avatar } = await this.userModel.findOne({ _id });

    const response = await axios
      .get(avatar, { responseType: 'arraybuffer' })
      .then((response) =>
        Buffer.from(response.data, 'binary').toString('base64'),
      );
    const path = `./src/assets/image${_id}.txt`;
    if (!existsSync(path)) {
      writeFileSync(path, response);
    }

    return avatar;
  }

  async remove(_id: string) {
    return this.userModel.deleteOne({ _id });
  }
}
