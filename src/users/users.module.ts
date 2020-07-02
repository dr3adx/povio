import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import {InjectModel, MongooseModule} from "@nestjs/mongoose";
import {User} from "../interfaces/user.interface";
import {UserSchema} from "../schemas/user.schema";

@Module({
  providers: [UsersService],
  exports: [UsersService],
  imports: [MongooseModule.forFeature([{name: 'User', schema: UserSchema, collection: 'users'}])],
})
export class UsersModule {}
