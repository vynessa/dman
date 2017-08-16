import express from 'express';
import logger from 'morgan';
import expressValidator from 'express-validator';
import bodyParser from 'body-parser';
import verifyToken from './middlewares/auth';
import router from './routes/router';

const app = express();
const port = process.env.PORT || 5000;

app.use(logger('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());

app.use('/api/v1', verifyToken);
app.use(router);

app.get('*', (req, res) => res.status(200).send(
  `Hello there! The API is at http://localhost:${port}/api/v1`
));

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});

export default app;
