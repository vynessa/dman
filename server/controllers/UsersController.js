import Helpers from '../utils/helper';

const User = require('../models').User;

/**
 * @class UsersController
 */
class UsersController {
  /**
   * @description
   * @param {any} req
   * @param {any} res
   * @returns {void}
   * @memberof UsersController
   */
  static registerUser(req, res) {
    User.find({
      where: {
        email: req.body.email
      }
    })
      .then((user) => {
        if (!user) {
          Helpers.createUser(req, res);
          return;
        }
        return res.status(401).send({ success: true, message: 'User exists! Please Login :)' });
      })
      .catch(err => res.status(401).send(err));
  }

  /**
   * @description
   * @static
   * @param {any} req
   * @param {any} res
   * @returns {void}
   * @memberof UsersController
   */
  static loginUser(req, res) {
    User.findOne({

    });
  }
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

  // static updateUser(req, res) {
  //   User.findById({

  //   });
  // }
}

export default UsersController;
