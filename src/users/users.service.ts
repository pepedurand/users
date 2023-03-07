import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Model } from 'mongoose';
import { User } from './interface/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

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
      throw new Error(`Failed to fetch data from url. Error: ${error.message}`);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
