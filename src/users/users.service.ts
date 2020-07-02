import {HttpException, HttpStatus, Injectable} from '@nestjs/common';

import { User } from "../interfaces/user.interface"
import {Model} from 'mongoose';
import {InjectModel} from "@nestjs/mongoose";
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {

    constructor(@InjectModel('User') private readonly userModel: Model<User>) {
    }

    public validateObjectId(val: string): boolean
    {
        // simple check
        return val.length === 24;
    }

    public async createUser(params: User): Promise<User> {
        const pwHash: string | Error = await bcrypt.hash(params.password, 10).catch((e: Error) => e);

        if (pwHash instanceof Error)
            throw new Error(`Error hasing password: ${pwHash.message}`);

        const newUser: Model<User> = new this.userModel({username: params.username, password: pwHash});

        return newUser.save();
    }

    public async findUser(username: string): Promise<User | undefined> {
        const user: Model<User> =  this.userModel.findOne({username: username});
        return user;
    }

    public async findUserById(id: string): Promise<User | undefined> {
        const user: Model<User> =  this.userModel.findOne({_id: id});
        return user;
    }

    public async updatePw(objectId: string, newPw: string): Promise<User | undefined> {

        const pwHash: string | Error = await bcrypt.hash(newPw, 10).catch((e: Error) => e);

        if (pwHash instanceof Error)
            throw new Error(`Error hasing password: ${pwHash.message}`);

        return this.userModel.findByIdAndUpdate(objectId, {password: pwHash});
    }

    public async getLikes(userId: string): Promise<User> {
        return this.userModel.findOne({_id: userId}, 'likes');
    }

    public async getAllUsers(): Promise<User[]> {
        return this.userModel.find();
    }

    public async likeUser(myId: string, targetId: string): Promise<any> {
        if (!this.validateObjectId(targetId))
            throw new HttpException('User ID has to be an ObjectId', HttpStatus.BAD_REQUEST);

        const checkTarget: User = await this.findUserById(targetId);

        if (!checkTarget)
            throw new HttpException('User does not exist!', HttpStatus.NOT_FOUND);

        const res: User = await this.getLikes(myId);

        let currentLikes: string = res.likes || "";

        if (currentLikes)
        {
            // check if user has already liked another user
            const spl: string[] = currentLikes.split(",");

            if (spl.includes(targetId))
                throw new HttpException(`You have already liked user with ID ${targetId} or the user doesn't exist`,
                    HttpStatus.BAD_REQUEST);

            currentLikes += ',' + targetId;
        }
        else
            currentLikes += targetId;

        await this.userModel.findByIdAndUpdate(myId, { $set: { likes: currentLikes }});

        return {resp: `Successfully liked user with ID ${targetId}`};
    }

    public async unlikeUser(myId: string, targetId: string): Promise<boolean> {
        const res: User = await this.getLikes(myId);

        let currentLikes: string = res.likes || "";

        if (currentLikes)
        {
            // check if user has already liked another user
            const spl: string[] = currentLikes.split(",");

            if (!spl.includes(targetId))
                return false;

            spl.splice(spl.indexOf(targetId), 1);
            currentLikes = spl.join(",");
        }
        else
            return false;

        await this.userModel.findByIdAndUpdate(myId, { $set: { likes: currentLikes }});

        return true;
    }

    public async getMostLiked(): Promise<any> {
        const allUsers: User[] = await this.getAllUsers();

        // map of userId => amount of likes
        const map: Map<string, number> = new Map();

        allUsers.map((user: User) => {
            const likes: string = user.likes;

            if (!likes)
                return;

            const spl: string[] = likes.split(',');

            spl.map((id: string) => {
                if (!map.has(id)) {
                    map.set(id, 1);
                    return;
                }

                map.set(id, map.get(id)+1);
            });
        });

        return [...map.entries()].sort((a, b) => b[1] - a[1]);
    }

    public async getUserLikes(userId: string): Promise<any> {
        if (!this.validateObjectId(userId))
            throw new HttpException('User ID has to be an ObjectId', HttpStatus.BAD_REQUEST);

        const userExists: Model<User> = await this.findUserById(userId);

        if (!userExists)
            throw new HttpException(`User ${userId} Not Found`, HttpStatus.NOT_FOUND);

        const allUsers: User[] = await this.getAllUsers();

        let likedByAmount: number = 0;
        let likesAmount: number = 0;

        allUsers.map((user: User) => {
            const likes: string = user.likes;

            if (!likes)
                return;

            const spl: string[] = likes.split(',');

            spl.map((id: string) => {
                if (id !== userId)
                    return;

                ++likedByAmount;
            });

            if (spl.length && user._id == userId)
                likesAmount = spl.length;
        });

        return {resp: `User has been liked by ${likedByAmount} people and user himself liked ${likesAmount} people`};
    }

}
