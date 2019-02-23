import * as express from 'express';
import { Application, Request, Response, Errback, NextFunction } from 'express';
import * as bodyParser from 'body-parser';
import * as expressJwt from 'express-jwt';
import * as jwt from 'jsonwebtoken';
import * as cookieParser from 'cookie-parser';
import User from './shared/models/User';
import Payload from './shared/types/Payload';
import IResponse from './shared/types/IResponse';
import { log } from './shared/utils';

const app: Application = express();
const secret = 'secret' || process.env.JWT_SECRET;
const users: User[] = [
    new User({
        id: 1,
        username: 'root',
        password: '111111' || process.env.ROOT_PASSWORD,
    }),
];

const tokens = {};

app.use(bodyParser.json());
app.use(cookieParser());
const auth = expressJwt({
        secret,
        requestProperty: 'tokenData',
        resultProperty: 'tokenData',
        getToken: (req: Request) => {
            let token: string | null = null;
            if (req.cookies['X-Token']) {
                token = req.cookies['X-Token'];
            } else if (req.headers['x-token']) {
                token = req.headers['x-token'] as string;
            }
            return token;
        },
        isRevoked: (req: any, payload: Payload, done: any) => {
            // TODO expired token Date.now() - payload.iat
            if (tokens[payload.id]) {
                return done(null, false);
            }
            return done(null, true);
        },
    });

app.post('/api/users/authentificate', (req: Request, res: Response) => {
    const user = users.find((userObj: User) => userObj.username === req.body.username);
    if (user && req.body.password === user.password) {
        const payload: Payload = { ...user.printData, iat: Date.now() };
        tokens[user.id] = jwt.sign(payload, secret);
        res.set({ 'X-Token': tokens[user.id] });
        res.cookie('X-Token', tokens[user.id], { maxAge: 900000, httpOnly: true });
        log('User authentificate', user.printData);
        return res.json({ ...user.printData, token: tokens[user.id] });
    }
    return res.sendStatus(403);
});

app.get('/api/users/logout', auth, (req: Request, res: IResponse) => {
    const user = users.find((u: User) => u.id === res.tokenData.id);
    if (user) {
        log('User logout', user.printData);
        delete tokens[user.id];
        res.clearCookie('X-Token');
        return res.sendStatus(204);
    }
    return res.sendStatus(500);
});

app.get('/api/', auth, (req: Request, res: IResponse) => {
    res.json(res.tokenData);
});

app.use((err: Errback, req: Request, res: IResponse, next: NextFunction) => {
    if (err.name === 'UnauthorizedError') {
        log('Invalid token', { url: req.originalUrl, tokenData: res.tokenData })
        res.sendStatus(401);
    }
});

app.listen(3000, () => {
    log('Server started: http://localhost:3000/');
});
