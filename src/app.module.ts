import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.DB_ADMIN}:${process.env.DB_ADMIN}@users.nff7kzb.mongodb.net/?retryWrites=true&w=majority`,
    ),
    ConfigModule.forRoot({
      envFilePath: ['.env', 'rabbitmq.env'],
    }),
    UsersModule,
  ],
})
export class AppModule {}
