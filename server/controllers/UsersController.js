import Helpers from '../utils/helper';
import { User, Document } from '../models';

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
          return Helpers.createUser(req, res);
        }
        return res.status(409).send({
          success: false,
          message: 'This user already exists!'
        });
      })
      .catch(error => res.status(400).send(error));
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
    User.find({
      where: {
        email: req.body.email
      }
    })
      .then((returningUser) => {
        if (!returningUser) {
          return res.status(400).send({
            success: false,
            message: 'Incorrect email or password'
          });
        }
        const user = new User();
        const checkPassword = user.validatePassword(
          req.body.password,
          returningUser.password
        );
        if (!checkPassword) {
          return res.status(400).send({
            message: 'Incorrect email or password'
          });
        }
        const token = user.generateJWT(returningUser.id, returningUser.role);
        return res.status(200).send({
          success: true,
          message: 'Login successful! :)',
          token,
          userDetails: {
            name: returningUser.fullName,
            id: returningUser.id,
            role: returningUser.role
          }
        });
      })
      .catch(error => res.status(400).send(error));
  }

  /**
   * @description
   * @static
   * @param {any} req
   * @param {any} res
   * @returns {object} response
   * @memberof UsersController
   */
  static createUser(req, res) {
    if (req.headers.authorization) {
      if (req.decoded.role === 'user') {
        return res.status(401).send({
          success: false,
          message: 'Unathorized access! Only an Admin can create a user'
        });
      }
      return UsersController.registerUser(req, res);
    }
    return res.status(400).send({
      message: 'Please set token in the header'
    });
  }

  /**
   * @description
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} response
   * @memberof UsersController
   */
  static getUsers(req, res) {
    if (req.decoded.role !== 'admin') {
      return res.status(401).send({
        message: 'Unauthorized access! All users can only be viewed by an admin'
      });
    }
    User.findAll()
      .then(users => res.status(200).send(users))
      .catch(error => res.status(400).send(error));
  }

  /**
   * @description
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} response
   * @memberof UsersController
   */
  static findUser(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return Helpers.invalidUserIdMessage(res);
    }
    User.findById(req.params.id)
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: 'User not found'
          });
        }
        return res.status(200).send(user);
      })
      .catch(error => res.status(400).send(error));
  }

  /**
   * @description
   * @static
   * @param {any} req
   * @param {any} res
   * @returns {object} response
   * @memberof UsersController
   */
  static updateUser(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return Helpers.invalidUserIdMessage(res);
    }
    if (req.body.password) {
      const user = new User();
      req.body.password = user.generateHash(req.body.password);
    }
    return Helpers.updateUser()
    .catch(error => res.status(400).send(error));
  }

  /**
   * @description
   * @static
   * @param {any} req
   * @param {any} res
   * @returns {object} response
   * @memberof UsersController
   */
  static deleteUser(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return Helpers.invalidUserIdMessage(res);
    }
    if (Number(req.decoded.id) === Number(req.params.id)
      || req.decoded.role === 'admin') {
      return User.findById(req.params.id)
        .then((user) => {
          if (user) {
            return user.destroy().then(() => res
                .status(200)
                .send({
                  message: 'Yipee! User deleted successfully!'
                })
            )
            .catch(error => res.status(400).send(error));
          }
          return res.status(404).send({
            message: 'User not found! :('
          });
        })
        .catch(error => res.status(400).send(error));
    }
    return res.status(401).send({
      message: 'Unathuorized Access! Only an admin can delete a user. ¯¯|_(ツ)_|¯¯'
    });
  }

}

export default UsersController;
