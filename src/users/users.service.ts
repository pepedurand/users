import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Model } from 'mongoose';
import { User } from './interface/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import axios from 'axios';
import { Image } from './interface/image.interface';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('image') private readonly imageModel: Model<Image>,
    @InjectModel('user') private readonly userModel: Model<User>,
    private readonly httpService: HttpService,
    private readonly mailerService: MailerService,
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
      const avatarImage = new this.imageModel({ userId: _id, file: path });
      return avatarImage.save();
    }

    return this.imageModel.findOne({ userId: _id });
  }

  async remove(userId: string) {
    const path = `./src/assets/image${userId}.txt`;
    unlinkSync(path);
    return this.imageModel.deleteOne({ userId });
  }
}
