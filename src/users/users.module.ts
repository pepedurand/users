import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './interface/user.schema';
import { HttpModule } from '@nestjs/axios';
import { ImageSchema } from './interface/image.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'image', schema: ImageSchema }]),
    HttpModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
