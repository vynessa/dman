import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';

const app = express();

const port = 8000 || process.env.PORT;

app.use(logger('dev'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('./routes/router')(app);

app.get('*', (req, res) => res.status(200).send(
  `Hello there! The API is at http://localhost:${port}/api`
));

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});

module.exports = app;
