import express from 'express';
import UsersController from './../controllers/UsersController';
import DocsController from './../controllers/DocsController';

const router = express.Router();

router.get('/api/v1', (req, res) => res.status(200).send({
  message: 'Welcome to the dMan API!',
}));

// Users endpoint
router.get('/api/v1/users', UsersController.getUsers)
  .get('/api/v1/users/:id', UsersController.findUser)
  .post('/api/v1/users/createuser', UsersController.createUser)
  .post('/api/v1/users/auth/register', UsersController.registerUser)
  .post('/api/v1/users/auth/login', UsersController.loginUser)
  .put('/api/v1/users/:id', UsersController.updateUser)
  .delete('/api/v1/users/:id', UsersController.deleteUser)
  .get('/api/v1/users/:id/documents', UsersController.findUserDocuments)
  .get('/api/v1/search/users', UsersController.searchUsers);

// Documents endpoint
router.get('/api/v1/documents', DocsController.getDocuments)
  .post('/api/v1/documents', DocsController.createDocument)
  .put('/api/v1/documents/:id', DocsController.updateDocument)
  .delete('/api/v1/documents/:id', DocsController.deleteDocument)
  .get('/api/v1/documents/:id', DocsController.findDocument)
  .get('/api/v1/search/documents', DocsController.searchDocuments);

export default router;
