import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {UsersService} from "../users/users.service";
import * as bcrypt from 'bcryptjs';


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    public async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findUser(username);

        return bcrypt.compare(pass, user.password).then((isMatch: boolean) => {

            return isMatch ? user : null;
        });
    }

    public async login(user: any) {
        const payload = { username: user.username, sub: user._id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
