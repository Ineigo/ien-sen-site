import * as express from 'express';
import { Application, Request, Response, Errback, NextFunction,  } from 'express';
import * as bodyParser from 'body-parser';
import * as expressJwt from 'express-jwt';
import * as jwt from 'jsonwebtoken';
import * as cookieParser from 'cookie-parser';
import User from './shared/models/User';
import Payload from './shared/types/Payload';

interface IRequest extends Request {
    tokenData?: Payload;
}

const app: Application = express();
const secret = 'secret' || process.env.JWT_SECRET;
const root: User = {
    id: 1,
    username: 'root',
    password: '111111' || process.env.ROOT_PASSWORD,
};

const tokens = {};

app.use(bodyParser.json());
app.use(cookieParser());
app.use(
    expressJwt({
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
        isRevoked: (req: any, payload: any, done: any) => {
            if (tokens[payload.id]) {
                console.log(payload, Date.now() - payload.iat);
                return done(null, false);
            }
            return done(null, true);
        },
    }).unless({ path: ['/api/users/authentificate'] })
);

app.post('/api/users/authentificate', (req: Request, res: Response) => {
    if (req.body.username === root.username && req.body.password === root.password) {
        const payload: Payload = { id: root.id, iat: Date.now() };
        tokens[root.id] = jwt.sign(payload, secret);
        res.set({ 'X-Token': tokens[root.id] });
        res.cookie('X-Token', tokens[root.id], { maxAge: 900000, httpOnly: true });
        const { password, ...user } = root;
        return res.json({ ...user, token: tokens[root.id] });
    }
    return res.sendStatus(403);
});

app.get('/api/users/logout', (req: IRequest, res: Response) => {
    console.log(req);
    delete tokens[req.tokenData.id];
    res.clearCookie('X-Token');
    return res.sendStatus(204);
});

app.get('/api/', (req: Request, res: Response) => {
    console.log(Object.keys(req), Object.keys(res));
    res.send('asdsadsaddsad');
});

app.use((err: Errback, req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('invalid token...');
    }
});

app.listen(3000, () => {
    console.log('Server started: http://localhost:3000/');
});
