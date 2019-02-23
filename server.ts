import * as express from 'express';
import { Application, Request, Response, Errback, NextFunction } from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { User } from './shared/models';
import { Payload, IResponse } from './shared/types';
import { log } from './shared/utils';
import { authGuardFabric, createToken, removeToken } from './server/AuthGuard';

const app: Application = express();
const secret: string = 'secret' || process.env.JWT_SECRET;
const users: User[] = [
    new User({
        id: 1,
        username: 'root',
        password: '111111' || process.env.ROOT_PASSWORD,
    }),
];

app.use(bodyParser.json());
app.use(cookieParser());

const auth = authGuardFabric(secret);

app.post('/api/users/authentificate', (req: Request, res: Response) => {
    const user = users.find((userObj: User) => userObj.username === req.body.username);
    if (user && req.body.password === user.password) {
        const payload: Payload = { ...user.printData, iat: Date.now() };
        const token = createToken(secret, payload);
        res.set({ 'X-Token': token });
        res.cookie('X-Token', token, { maxAge: 900000, httpOnly: true });
        log('User authentificate', user.printData);
        return res.json({ ...user.printData, token: token });
    }
    return res.sendStatus(403);
});

app.get('/api/users/logout', auth, (req: Request, res: IResponse) => {
    const user = users.find((u: User) => u.id === res.tokenData.id);
    if (user) {
        log('User logout', user.printData);
        removeToken(user.id);
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
