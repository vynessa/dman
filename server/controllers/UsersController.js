import Helpers from '../utils/Helpers';
import Utils from '../utils/Utils';
import { User, Document } from '../models';

/**
 * @class UsersController
 */
class UsersController {

  /**
   * @description This enables users to register on the
   * application and get a generated JWT
   *
   * @param {object} req HTTP request object
   * @param {object} res HTTP response object
   *
   * @returns {object} User
   *
   * @memberof UsersController
   */
  static registerUser(req, res) {
    const errorMessage = 'createUserError';
    const errors = Helpers.formValidator(req, errorMessage);
    if (errors) {
      return res.status(400).send({
        message: 'Error while registering',
        errors: {
          message: errors[0].msg
        }
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
        return Utils.emailConflictResponse(res);
      })
      .catch(error => res.status(500).send(error));
  }

  /**
   * @description This allow users login into the
   * application if registered
   *
   * @static
   *
   * @param {object} req HTTP request object
   * @param {object} res HTTP response object
   *
   * @returns {object} User
   *
   * @memberof UsersController
   */
  static loginUser(req, res) {
    const errorMessage = 'loginError';
    const errors = Helpers.formValidator(req, errorMessage);
    if (errors) {
      return res.status(400).send({
        message: 'Error while Logging in',
        errors: {
          message: errors[0].msg
        }
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
        const { fullName, id, role } = returningUser;
        const token = user.generateToken(id, role, fullName);
        return res.status(200).send({
          token,
          user: { fullName, id, role }
        });
      })
      .catch(error => res.status(500).send(error));
  }

  /**
   * @description This enables the admin user only to create users
   *
   * @static
   *
   * @param {object} req HTTP request object
   * @param {object} res HTTP response object
   *
   * @returns {object} User
   *
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
   * users in the application
   *
   * @static
   *
   * @param {object} req HTTP request object
   * @param {object} res HTTP response object
   *
   * @returns {object} User
   *
   * @memberof UsersController
   */
  static getUsers(req, res) {
    if (req.decoded.role !== 'admin') {
      return res.status(403).send({
        message: 'Unauthorized access! All users can only be viewed by an admin'
      });
    }
    const { limit, offset } = Helpers.limitAndOffsetValidator(
        req.query.limit,
        req.query.offset,
        res
    );

    if (!limit) return;
    const query = {
      limit,
      offset,
      attributes: ['fullName', 'id', 'email', 'role', 'createdAt']
    };
    User.findAll(query).then((users) => {
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
   *
   * @static
   *
   * @param {object} req HTTP request object
   * @param {object} res HTTP response object
   *
   * @returns {object} User
   *
   * @memberof UsersController
   */
  static findUser(req, res) {
    if (req.decoded.role !== 'admin') {
      return res.status(403).send({
        message: 'Unauthorized access! Only an admin can get a user'
      });
    }
    if (!Number.isInteger(Number(req.params.id))) {
      return Helpers.idValidator(res);
    }
    return User.findById(Math.abs(req.params.id))
      .then((user) => {
        if (!user) {
          return Utils.noUserResponse(res);
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
   * while an admin can get any user's documents by id
   *
   * @static
   *
   * @param {object} req HTTP request object
   * @param {object} res HTTP response object
   *
   * @returns {object} User
   *
   * @memberof DocsController
   */
  static findUserDocuments(req, res) {
    const id = req.params.id;
    if (!Number.isInteger(Number(id))) {
      return Helpers.idValidator(res);
    }
    const { limit, offset } = Helpers.limitAndOffsetValidator(
      req.query.limit,
      req.query.offset,
      res
    );
    if (!limit) return;
    const query = {
      limit,
      offset,
      where: {
        userId: id,
      },
      attributes: ['id', 'title', 'owner', 'accessType', 'createdAt']
    };
    if (req.decoded.role === 'admin'
      || Number(req.decoded.id) === Number(id)) {
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
   * while the admin can update any user's profile
   *
   * @static
   *
   * @param {object} req HTTP request object
   * @param {object} res HTTP response object
   *
   * @returns {object} User
   *
   * @memberof UsersController
   */
  static updateUser(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return Helpers.idValidator(res);
    }
    if (req.body.role && req.decoded.role === 'user') {
      return res.status(403).send({
        message: 'Unauthorized access! Only an admin can update roles'
      });
    }
    return Helpers.updateUserHelper(req, res);
  }

  /**
   * @description Enables a user delete his profile
   * while an admin can delete all
   *
   * @static
   *
   * @param {object} req HTTP request object
   * @param {object} res HTTP response object
   *
   * @returns {object} response
   *
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
          return Utils.noUserResponse(res);
        })
        .catch(error => res.status(500).send(error));
    }
    return res.status(403).send({
      message: 'Unathuorized Access! ¯¯|_(ツ)_|¯¯'
    });
  }

  /**
   * @description Enables the admin search for a particular user
   *
   * @static
   *
   * @param {object} req HTTP request object
   * @param {object} res HTTP response object
   *
   * @returns {object} User
   *
   * @memberof UsersController
   */
  static searchUsers(req, res) {
    if (!req.query.q) {
      return res.status(400).send({
        message: 'Please enter a keyword'
      });
    }
    const query = Helpers.userSearchQuery(req, res);
    if (!query) return false;
    if (req.decoded.role === 'admin') {
      return User.findAll(query).then((users) => {
        const totalUsersCount = users.length;
        const metaData = Helpers.pagination(
          query.limit,
          query.offset,
          totalUsersCount,
          users
        );
        if (users.length === 0) {
          return Utils.noUserResponse(res);
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
