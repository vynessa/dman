import Helpers from '../utils/Helpers';
import { User, Document } from '../models';

/**
 * @class UsersController
 */
class UsersController {

  /**
   * @description This enables users to register on the
      application and get a generated JWT
   * @param {object} req
   * @param {object} res
   * @returns {object} User
   * @memberof UsersController
   */
  static registerUser(req, res) {
    const errorMessage = 'createUserError';
    const errors = Helpers.formValidator(req, errorMessage);
    if (errors) {
      return res.status(400).send({
        message: 'Error while registering',
        errors
      });
    }
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
          message: 'This user already exists!'
        });
      })
      .catch(error => res.status(500).send(error));
  }

  /**
   * @description This allow users login into the
      application if registered
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} User
   * @memberof UsersController
   */
  static loginUser(req, res) {
    const errorMessage = 'loginError';
    const errors = Helpers.formValidator(req, errorMessage);
    if (errors) {
      return res.status(400).send({
        message: 'Error while Logging in',
        errors
      });
    }
    User.find({
      where: {
        email: req.body.email
      }
    })
      .then((returningUser) => {
        if (!returningUser) {
          return res.status(401).send({
            message: 'Incorrect email or password'
          });
        }
        const user = new User();
        const checkPassword = user.validatePassword(
          req.body.password,
          returningUser.password
        );
        if (!checkPassword) {
          return res.status(401).send({
            message: 'Incorrect email or password'
          });
        }
        const token = user.generateToken(
          returningUser.id,
          returningUser.role,
          returningUser.fullName
        );
        return res.status(200).send({
          token,
          user: {
            fullName: returningUser.fullName,
            id: returningUser.id,
            role: returningUser.role
          }
        });
      })
      .catch(error => res.status(500).send(error));
  }

  /**
   * @description This enables the admin user only to create other users
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} User
   * @memberof UsersController
   */
  static createUser(req, res) {
    if (req.decoded.role === 'user') {
      return res.status(403).send({
        message: 'Unathorized access! Only an admin can create a user'
      });
    }
    return UsersController.registerUser(req, res);
  }

  /**
   * @description Enables admin users only to get all
      users in the application
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} User
   * @memberof UsersController
   */
  static getUsers(req, res) {
    if (req.decoded.role !== 'admin') {
      return res.status(403).send({
        message: 'Unauthorized access! All users can only be viewed by an admin'
      });
    }
    if (req.query.limit || req.query.offset) {
      return Helpers.limitAndOffsetValidator(
        req.query.limit,
        req.query.offset,
        res
      );
    }
    const query = {
      attributes: ['fullName', 'id', 'email', 'role', 'createdAt']
    };
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;

    return User.findAll({
      offset,
      limit,
      attributes: query.attributes
    }).then((users) => {
      if (users.length === 0) {
        return res.status(404).send({
          message: 'No user found!'
        });
      }
      const totalUsersCount = users.length;
      const metaData = Helpers.pagination(
        limit, offset, totalUsersCount, users
      );
      res.status(200).send({
        message: `Number of users found: ${totalUsersCount}`,
        users,
        metaData
      });
    })
    .catch(error => res.status(500).send(error));
  }

  /**
   * @description Enables only an admin get a user by id
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} User
   * @memberof UsersController
   */
  static findUser(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return Helpers.idValidator(res);
    }
    if (req.decoded.role !== 'admin') {
      return res.status(403).send({
        message: 'Unauthorized access! Only an admin can get a user'
      });
    }
    return User.findById(Math.abs(req.params.id))
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
      .catch(error => res.status(500).send(error));
  }

  /**
   * @description Users can get all documents belonging to them by id
      while an admin can get any user's documents by id
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} User
   * @memberof DocsController
   */
  static findUserDocuments(req, res) {
    const id = req.params.id;
    const query = {
      where: {
        userId: id,
      },
      attributes: ['id', 'title', 'owner', 'accessType', 'createdAt']
    };
    if (req.query.limit || req.query.offset) {
      return Helpers.limitAndOffsetValidator(
        req.query.limit,
        req.query.offset,
        res
      );
    }
    if (!Number.isInteger(Number(id))) {
      return Helpers.idValidator(res);
    }
    if (req.decoded.role === 'admin'
      || Number(req.decoded.id) === Number(id)) {
      const limit = req.query.limit || 10;
      const offset = req.query.offset || 0;
      return Document.findAll(query)
      .then((documents) => {
        if (documents.length === 0) {
          return res.status(404).send({
            message: 'No document found!'
          });
        }
        const totalDocsCount = documents.length;
        const metaData = Helpers.pagination(
          limit, offset,
          totalDocsCount, documents
        );
        return res.status(200).send({
          message: `Number of documents found: ${totalDocsCount}`,
          documents,
          metaData
        });
      }).catch(error => res.status(500).send(error));
    }
    return res.status(403).send({
      message: 'Unauthorized access! ¯¯|_(ツ)_|¯¯'
    });
  }

  /**
   * @description Enables users update their profile except their role
      while the admin can update any user's profile
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} User
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
      return res.status(403).send({
        message: 'Unauthorized access! Only an admin can update roles'
      });
    }
    return Helpers.updateUserHelper(req, res).catch(error =>
      res.status(500).send(error)
    );
  }

  /**
   * @description Enables a user delete his profile
      while an admin can delete all
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
    if (
      Number(req.decoded.id) === Number(req.params.id) ||
      req.decoded.role === 'admin'
    ) {
      return User.findById(Math.abs(req.params.id))
        .then((user) => {
          if (user) {
            return user
              .destroy()
              .then(() =>
                res.status(200).send({
                  message: 'Yipee! User deleted successfully!'
                })
              )
              .catch(error => res.status(400).send(error));
          }
          return res.status(404).send({
            message: 'User not found! :('
          });
        })
        .catch(error => res.status(500).send(error));
    }
    return res.status(403).send({
      message: 'Unathuorized Access! ¯¯|_(ツ)_|¯¯'
    });
  }

  /**
   * @description Enables the admin search for a particular user
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} User
   * @memberof UsersController
   */
  static searchUsers(req, res) {
    const query = Helpers.userSearchQuery(req);
    if (req.query.limit || req.query.offset) {
      return Helpers.limitAndOffsetValidator(
        req.query.limit,
        req.query.offset,
        res
      );
    }
    if (!req.query.q) {
      return res.status(400).send({
        message: 'Please enter a keyword'
      });
    }
    if (req.decoded.role === 'admin') {
      const limit = req.query.limit || 10;
      const offset = req.query.offset || 0;
      return User.findAll({
        offset,
        limit,
        where: query.where,
        attributes: query.attributes
      }).then((users) => {
        const totalUsersCount = users.length;
        const metaData = Helpers.pagination(
          limit,
          offset,
          totalUsersCount,
          users
        );
        if (users.length === 0) {
          return res.status(404).send({
            message: 'User not found!'
          });
        }
        return res.status(200).json({
          message: `Number of users found: ${totalUsersCount}`,
          users,
          metaData
        });
      })
    .catch(error => res.status(500).send(error));
    }
    return res.status(403).send({
      message: 'Unauthorized access! ¯¯|_(ツ)_|¯¯'
    });
  }
}

export default UsersController;
