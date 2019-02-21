import * as express from 'express';
import * as bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());

app.post('/api/users/authentificate', () => {});
app.post('/api/users/register', () => {});
app.get('/api/users', (req: any, res: any) => {
    // res.json({});
});
app.get('/api/users/:id', () => {});
app.delete('/api/users/:id', () => {});

app.listen(3000, () => {
    console.log('Server started: http://localhost:3000/');
});
