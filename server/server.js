import express from 'express';
import logger from 'morgan';
import validator from 'express-validator';
import bodyParser from 'body-parser';
import verifyToken from './middlewares/auth';
import valueChecker from './middlewares/valueChecker';
import router from './routes/router';

const app = express();
const port = process.env.PORT || 8000;

app.use(logger('dev'));
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(validator());

app.use('/api/v1', verifyToken);
app.use(valueChecker);
app.use(router);

app.use('*', (req, res) => res.redirect(302, '/'));

app.listen(port);

export default app;
