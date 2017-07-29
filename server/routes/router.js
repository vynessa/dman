// import express from 'express';
import documentsController from './../controllers/documents';
import usersController from './../controllers/users';

// const router = express.Router();


module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send(
    'Welcome to the dMan API!',
  ));

  // app.get('/api/v1/users', usersController.getUser);
  app.post('/api/v1/documents', documentsController.createDocument);

  // app.get('/api/v1/documents', documentsController.createDocument);
};
