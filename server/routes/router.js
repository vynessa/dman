import express from 'express';
import UsersController from './../controllers/UsersController';

const router = express.Router();

router.get('/api/v1', (req, res) => res.status(200).send({
  message: 'Welcome to the dMan API!',
}));

router.get('/api/v1/users', UsersController.getUsers)
  .get('/api/v1/users/:id', UsersController.findUser)
  .post('/api/v1/users/createuser', UsersController.createUser)
  .post('/api/v1/users/auth/register', UsersController.registerUser)
  .post('/api/v1/users/auth/login', UsersController.loginUser)
  .put('/api/v1/users/:id', UsersController.updateUser)
  .delete('/api/v1/users/:id', UsersController.deleteUser);

export default router;
