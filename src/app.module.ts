import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import {UserSchema} from "./schemas/user.schema";
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import {UsersService} from "./users/users.service";

@Module({
  controllers: [
    UserController,
  ],
  imports: [
    MongooseModule.forRoot(
      'mongodb://povio:hrehp831413@116.202.113.158:27017/povio',
      {
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    ),
    MongooseModule.forFeature([{name: 'User', schema: UserSchema, collection: 'users'}]),
    AuthModule,
    UsersModule,
  ],
  providers: [
    UsersService,
  ],
})
export class AppModule {}
