import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Model } from 'mongoose';
import { User } from './interface/user.interface';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel('user') private readonly userModel: Model<User>) {}
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

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
