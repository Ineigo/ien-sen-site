import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as expressJwt from 'express-jwt';
import * as jwt from 'jsonwebtoken';
import * as cookieParser from 'cookie-parser';
import User from './shared/models/User';

const app: express.Application = express();
const secret = 'secret';
const root: User = {
    id: 1,
    username: 'root',
    password: '111111',
    token: '',
};

app.use(bodyParser.json());
app.use(cookieParser());
app.use(
    expressJwt({
        secret,
        getToken: function fromHeaderOrQuerystring(req: express.Request) {
            let token: string | null = null;
            if (req.cookies['X-Token']) {
                token = req.cookies['X-Token'];
            } else if (req.headers['x-token']) {
                token = req.headers['x-token'] as string;
            }
            return token === root.token ? token : null;
        },
    }).unless({ path: ['/api/users/authentificate', '/api/users/logout'] })
);

app.post('/api/users/authentificate', (req: express.Request, res: express.Response) => {
    if (req.body.username === root.username && req.body.password === root.password) {
        root.token = jwt.sign({ sub: root.id }, secret);
        res.set({ 'X-Token': root.token });
        res.cookie('X-Token', root.token, { maxAge: 900000, httpOnly: true });
        const { password, ...user } = root;
        return res.json(user);
    }
    return res.sendStatus(403);
});

app.get('/api/users/logout', (req: express.Request, res: express.Response) => {
    root.token = '';
    res.clearCookie('X-Token');
    return res.sendStatus(204);
});

app.get('/api/', (req: express.Request, res: express.Response) => {
    res.send('asdsadsaddsad');
});

app.use((err: express.Errback, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('invalid token...');
    }
});

app.listen(3000, () => {
    console.log('Server started: http://localhost:3000/');
});
