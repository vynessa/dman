const User = require('../models').User;

/**
 * @class UsersController
 */
class UsersController {
  /**
   * @description
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {void}
   * @memberof UsersController
   */
  static getUsers(req, res) {
    User.findAll()
    .then(users => res.status(200).send(users))
    .catch(err => res.status(401).send(err));
  }

  /**
   * @description
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {void}
   * @memberof UsersController
   */
  static createUser(req, res) {
    User.find({
      where: {
        email: req.body.email
      }
    }).then((response) => {
      if (response) {
        return res.status(400).send({
          message: 'Sorry, this user exists :('
        });
      }
      return User.create({
        fullName: req.body.fullName,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password
      })
      .then(user => res.status(200).send(user))
      .catch(error => res.status(401).send(error));
    });
  }
}

export default UsersController;

