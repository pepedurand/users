import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() createUser: CreateUserDto) {
    return await this.usersService.create(createUser);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Get(':id/avatar')
  async findUserAvatar(@Param('id') id: string) {
    return await this.usersService.findUserAvatar(id);
  }

  @Delete(':id/avatar')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
