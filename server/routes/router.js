import express from 'express';
import UsersController from './../controllers/UsersController';

const router = express.Router();

router.get('/api/v1', (req, res) => res.status(200).send({
  message: 'Welcome to the dMan API!',
}));

router.get('/api/v1/users', UsersController.getUsers);
router.post('/api/v1/users', UsersController.createUser);

module.exports = router;
