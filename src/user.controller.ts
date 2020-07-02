import {
  Controller,
  Delete,
  Get,
  Post,
  Param,
  HttpStatus,
  Request,
  Body,
  UseGuards,
  Res,
  HttpException, Patch, Put
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {LocalAuthGuard} from "./auth/local-auth.guard";
import {AuthService} from "./auth/auth.service";
import {JwtAuthGuard} from "./auth/jwt-auth.guard";
import {UsersService} from "./users/users.service";
import {User} from "./interfaces/user.interface";
import {Model} from 'mongoose';

@Controller('')
export class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  public async signup(
      @Body('username') username: string,
      @Body('password') password: string, // separated by comma if multiple hobbies
  ): Promise<any> {
    // features has default value based on the hobby in the schema

    if (!username || typeof(username) !== "string")
      throw new HttpException('Username has to be provided and has a string!', HttpStatus.BAD_REQUEST);

    if (!password || typeof(password) !== "string")
      throw new HttpException('Password has to be provided and has to be a string!', HttpStatus.BAD_REQUEST);

    if (await this.usersService.findUser(username))
      throw new HttpException('User with given username already exists!', HttpStatus.BAD_REQUEST);

    return this.usersService.createUser({username: username, password: password});
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  public async login(@Request() req) {
    if (!req.user.username || typeof(req.user.username) !== "string")
      throw new HttpException('Username has to be provided and has a string!', HttpStatus.BAD_REQUEST);

    if (!req.user.password || typeof(req.user.password) !== "string")
      throw new HttpException('Password has to be provided and has to be a string!', HttpStatus.BAD_REQUEST);


    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  public async getMe(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/update-password')
  public async updatePw(
    @Request() req,
    @Body('newpw') newpw: string): Promise<any> {

    if (!newpw)
      throw new HttpException('No password provided!', HttpStatus.BAD_REQUEST);

    return this.usersService.updatePw(req.user._id, newpw);
  }

  @UseGuards(JwtAuthGuard)
  @Put('user/:id/like')
  public async likeUser(
      @Request() req,
      @Param('id') id: string): Promise<any> {

    if (!id)
      throw new HttpException('No Target ID provided!', HttpStatus.BAD_REQUEST);

    return this.usersService.likeUser(req.user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('user/:id/unlike')
  public async unlikeUser(
      @Request() req,
      @Param('id') id: string): Promise<any> {

    if (!id)
      throw new HttpException('No Target ID provided!', HttpStatus.BAD_REQUEST);

    const success: boolean = await this.usersService.unlikeUser(req.user._id, id);

    if (success)
      return `Successfully unliked user with ID ${id}`;

    throw new HttpException(`You haven't liked user with ID ${id}`, HttpStatus.BAD_REQUEST);
  }

  @Get('most-liked')
  public async getMostLiked(
      @Param('username') username: string,
  ): Promise<any> {
    const res: any = await this.usersService.getMostLiked();

    if (!res.length)
      throw new HttpException('Most liked list is empty', HttpStatus.NOT_FOUND);

    return {mostLiked: res};
  }

  @Get('user/:id')
  public async getUser(
    @Param('id') id: string,
  ): Promise<any> {
    return this.usersService.getUserLikes(id);
  }
}
