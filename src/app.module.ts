import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://admin:admin@users.nff7kzb.mongodb.net/?retryWrites=true&w=majority',
    ),
    UsersModule,
  ],
})
export class AppModule {}
