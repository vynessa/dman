import Helpers from '../utils/helper';
import { User, Document } from '../models';

/**
 * @class UsersController
 */
class UsersController {
  /**
   * @description
   * @param {object} req
   * @param {object} res
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
          return Helpers.createUserHelper(req, res);
        }
        return res.status(409).send({
          success: false,
          message: 'This user already exists!'
        });
      })
      .catch(error => res.status(500).send(error));
  }

  /**
   * @description
   * @static
   * @param {object} req
   * @param {object} res
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
          return res.status(403).send({
            message: 'Incorrect email or password'
          });
        }
        const user = new User();
        const checkPassword = user.validatePassword(
          req.body.password,
          returningUser.password
        );
        if (!checkPassword) {
          return res.status(403).send({
            message: 'Incorrect email or password'
          });
        }
        const token = user.generateToken(returningUser.id, returningUser.role, returningUser.fullName);
        return res.status(200).send({
          token,
          user: {
            name: returningUser.fullName,
            id: returningUser.id,
            role: returningUser.role
          }
        });
      })
      .catch(error => res.status(500).send(error));
  }

  /**
   * @description
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} response
   * @memberof UsersController
   */
  static createUser(req, res) {
    if (req.headers.authorization) {
      if (req.decoded.role === 'user') {
        return res.status(401).send({
          success: false,
          message: 'Unathorized access! Only an admin can create a user'
        });
      }
      return UsersController.registerUser(req, res);
    }
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
    const query = {
      attributes: ['fullName', 'id', 'role', 'createdAt']
    };
    User.findAll(query)
      .then((users) => {
        if (users.length === 0) {
          return res.status(404).send({
            message: 'No users found!'
          });
        }
        res.status(200).json({ message: 'All users found', users });
      })
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
      return Helpers.idValidator(res);
    }
    User.findById(Math.abs(req.params.id))
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: 'User not found!'
          });
        }
        return res.status(200).send({
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
          }
        });
      })
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
  static updateUser(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return Helpers.idValidator(res);
    }
    const user = new User();
    if (req.body.password) {
      req.body.password = user.generateHash(req.body.password);
    }
    if (req.body.role && req.decoded.role === 'user') {
      return res.status(401).send({
        message: 'Unauthorized access ¯¯|_(ツ)_|¯¯'
      });
    }
    return Helpers.updateUserHelper(req, res)
    .catch(error => res.status(500).send(error));
  }

  /**
   * @description
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} response
   * @memberof UsersController
   */
  static deleteUser(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return Helpers.idValidator(res);
    }
    if (Number(req.decoded.id) === Number(req.params.id)
      || req.decoded.role === 'admin') {
      return User.findById(Math.abs(req.params.id))
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
      message: 'Unathuorized Access! ¯¯|_(ツ)_|¯¯'
    });
  }

  /**
   * description searchUsers: Search for a particular user
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} user
   * @memberof UsersController
   */
  static searchUsers(req, res) {
    const searchString = Helpers.stringFilter(req.query.q);
    const query = {
      where: {
        $or: [{
          fullName: {
            $ilike: `%${searchString}%`
          }
        }, {
          email: {
            $ilike: `%${searchString}%`
          }
        }]
      },
      attributes: ['fullName', 'email', 'id']
    };
    if (!req.query.q) {
      return res.status(400).send({
        message: 'Please enter a keyword'
      });
    }
    if (req.decoded.role === 'admin') {
      return User
      .findAll(query)
      .then((user) => {
        if (user[0] === undefined) {
          return res.status(404).send({
            message: 'User not found!'
          });
        }
        return res.status(200).json({
          message: 'User found successfully',
          user
        });
      })
      .catch(error => res.status(500).send(error));
    }
    return res.status(401).send({
      message: 'Unauthorized access! ¯¯|_(ツ)_|¯¯'
    });
  }
}

export default UsersController;
