
import * as expressJwt from 'express-jwt';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { Payload } from '../shared/types';

const tokens = {};

export function authGuardFabric(secret: string) {
    return expressJwt({
        secret,
        requestProperty: 'tokenData',
        resultProperty: 'tokenData',
        getToken,
        isRevoked,
    });
};

export function removeToken(id: number): void {
    if (tokens[id]) {
        delete tokens[id];
    }
}

export function createToken(secret: string, payload: Payload): string {
    tokens[payload.id] = jwt.sign(payload, secret);
    return tokens[payload.id];
}

function getToken(req: Request): string {
    let token: string | null = null;
    if (req.cookies['X-Token']) {
        token = req.cookies['X-Token'];
    } else if (req.headers['x-token']) {
        token = req.headers['x-token'] as string;
    }
    return token;
}

function isRevoked(req: any, payload: Payload, done: any) {
    // TODO expired token Date.now() - payload.iat
    if (tokens[payload.id]) {
        return done(null, false);
    }
    return done(null, true);
}
