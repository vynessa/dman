import { documentsController, usersController, rolesController } from './../controllers/index';

module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the dMan API!',
  }));

  app.post('/api/v1/documents', documentsController.createDocument);
};
