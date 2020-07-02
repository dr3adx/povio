import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import {INestApplication, HttpService, HttpModule, HttpStatus} from '@nestjs/common';
import { UsersService } from '../src/users/users.service';
import { UsersModule } from '../src/users/users.module';
import { UserController } from '../src/user.controller';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import * as request from 'supertest';
import {MongooseModule} from "@nestjs/mongoose";
import {UserSchema} from "../src/schemas/user.schema";

describe('AppController (e2e)', () => {
    //let app: INestApplication;

    const app: string = 'http://localhost:3000';
    const testToken: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Q4Iiwic3ViIjoiNWVmYzE5ZTc0ZDAyZTRmNjFjM2EyNTJlIiwiaWF0IjoxNTkzNzI1NTQyLCJleHAiOjE2MjUyNjE1NDJ9.2xRHzbLWzM8qItFqMASM0y64cHgTVpFWoQBJkeK_S_M';

    describe('SIGNUP', () => {
        it('throws error if POST /signup request > user already exists', async () => {
            return request(app)
                .post('/signup')
                .send({username: 'test10', password: 'test10'})
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('throws error if POST /signup request > no password provided', async () => {
            return request(app)
                .post('/signup')
                .send({username: 'test10'})
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('throws error if POST /signup request > no username provided', async () => {
            return request(app)
                .post('/signup')
                .send({password: 'test10'})
                .expect(HttpStatus.BAD_REQUEST);
        });
    });

    //login

    describe('LOGIN', () => {
        it('throws error if POST /login request > wrong password', async () => {
            return request(app)
                .post('/login')
                .send({username: 'test8', password: 'wrong'})
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('OK status if POST /login request > correct password', async () => {
            return request(app)
                .post('/login')
                .send({username: 'test8', password: 'haha'})
                .expect(HttpStatus.CREATED);
        });

        it('throws error if POST /login request > no username provided', async () => {
            return request(app)
                .post('/login')
                .send({password: 'haha'})
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('throws error if POST /login request > no password provided', async () => {
            return request(app)
                .post('/login')
                .send({username: 'test8'})
                .expect(HttpStatus.UNAUTHORIZED);
        });
    });

    // me/update-password
    describe('UPDATE PASSWORD', () => {
        it('throws error if PATCH /me/update-password request > no auth header provided', async () => {
            return request(app)
                .patch('/me/update-password')
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('throws error if PATCH /me/update-password > no new password provided', async () => {
            return request(app)
                .patch('/me/update-password')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(HttpStatus.BAD_REQUEST);
        });
    });

    // user/:id/like

    describe('LIKE USER', () => {
        it('throws error if PUT /user/:id/like > unauthorized', async () => {
            return request(app)
                .put('/user/1234/like')
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('throws error if PUT /user/:id/like > no target ID provided', async () => {
            return request(app)
                .put('/user//like')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('throws error if PUT /user/:id/like > user ID is not an ObjectId', async () => {
            return request(app)
                .put('/user/123/like')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('throws error if PUT /user/:id/like > user does not exist', async () => {
            return request(app)
                .put('/user/5efc199723502eebb8a4dcbb/like')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(HttpStatus.NOT_FOUND);
        });
    });

    // /user/:id/unlike

    describe('UNLIKE USER', () => {
        it('throws error if PUT /user/:id/unlike > unauthorized', async () => {
            return request(app)
                .put('/user/1234/unlike')
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('throws error if PUT /user/:id/unlike >  no target ID provided', async () => {
            return request(app)
                .put('/user//unlike')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('throws error if PUT /user/:id/unlike > user does not exist', async () => {
            return request(app)
                .put('/user/1341/unlike')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(HttpStatus.BAD_REQUEST);
        });
    });

    describe('MOST-LIKED', () => {
        it('OK status if GET /most-liked > there is more than 1 most liked user', async () => {
            return request(app)
                .get('/most-liked')
                .expect(({body}) => {
                    expect(body.mostLiked).toBeDefined();
                });
        });
    });

    describe('ME', () => {
        it('throws error if GET /me > unauthorized', async () => {
            return request(app)
                .get('/me')
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('OK status if GET /me > authorized', async () => {
            return request(app)
                .get('/me')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(({body}) => {
                    expect(body._id).toBeDefined();
                    expect(body.username).toBeDefined();
                });
        });
    });

    describe('GET USER LIKES', () => {
        it('throws error if GET /user/:id > user ID is not Object Id', async () => {
            return request(app)
                .get('/user/123')
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('throws error if GET /user/:id > user does not exist', async () => {
            return request(app)
                .get('/user/5efc199723502eebb8a4dcbb')
                .expect(HttpStatus.NOT_FOUND);
        });

    });
});


