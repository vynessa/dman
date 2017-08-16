import { User, Document } from '../models';

/**
 *
 *
 * @class Helpers
 */
class Helpers {
  /**
   * @description
   * @static
   * @param {any} req
   * @param {any} res
   * @returns {object} User
   * @memberof Helpers
   */
  static createUser(req, res) {
    const user = new User();
    return User.create({
      fullName: req.body.fullName,
      email: req.body.email,
      role: 'user',
      password: user.generateHash(req.body.password)
    })
      .then((newUser) => {
        const token = user.generateJWT(newUser.id, newUser.role);
        res.status(201).send({
          success: true,
          message: 'User created successfully!',
          user: {
            token,
            id: newUser.id,
            fullName: newUser.fullName,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt
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
   * @returns {object} user
   * @memberof Helpers
   */
  static updateUser(req, res) {
    return User.findById(req.params.id)
    .then((user) => {
      if (req.body.role) {
        if (req.decoded.role !== 'admin') {
          return res.status(401).send({
            message: 'Unauthorized access! Only an admin can update roles'
          });
        }
      }
      if (!user) {
        return res.status(400).send({
          message: 'Sorry, the user does not exist!'
        });
      }
      if (Number(req.decoded.id) !== Number(req.params.id)) {
        return res.status(401).send({
          message: 'Unauthorized access'
        });
      }
      return user
        .update(req.body, { fields: Object.keys(req.body) })
        .then(() =>
          res.status(200).send({
            message: 'Account successfully updated',
            user: {
              name: user.fullName,
              email: user.email,
              role: user.role,
              id: user.id
            }
          })
        )
        .catch(error => res.status(400).send(error));
    });
  }

  /**
   * @description
   * @static
   * @param {any} req
   * @param {any} res
   * @returns {object} Document
   * @memberof Helpers
   */
  static createDocument(req, res) {
    return Document.create({
      title: req.body.title,
      content: req.body.content,
      owner: req.body.owner,
      accessType: req.body.accessType,
      userId: req.body.userId
    })
      .then(document =>
        res.status(201).send({
          success: true,
          message: 'Document created successfully',
          document: {
            title: document.title,
            content: document.content,
            owner: document.owner,
            accessType: document.accessType,
            userId: document.userId,
            createdAt: document.createdAt
          }
        })
      )
      .catch(error => res.status(400).send(error));
  }

  /**
   * @description
   * @static
   * @param {any} req
   * @param {any} res
   * @returns {object} document
   * @memberof Helpers
   */
  static updateDocument(req, res) {
    return Document.findById(req.params.id)
    .then((document) => {
      if (req.body.role) {
        if (req.decoded.role !== 'admin') {
          return res.status(401).send({
            message: 'Unauthorized Access! Only Admin can Update Role'
          });
        }
      }
      if (!document) {
        return res.status(404).send({
          message: 'Sorry, the document does not exist!'
        });
      }
      if (Number(req.decoded.userId) !== Number(req.params.Id)) {
        return res.status(401).send({
          message: 'Unauthorized Access'
        });
      }
      return document
        .update(req.body, { fields: Object.keys(req.body) })
        .then(() =>
          res.status(200).send({
            message: 'Document Successfully Updated',
            user: {
              title: document.title,
              content: document.content,
              owner: document.owner,
              accessType: document.accessType
            }
          })
        )
        .catch(error => res.status(400).send(error));
    });
  }

  /**
   * @description
   * @param {any} res
   * @returns {object} response
   * @memberof Helpers
   */
  static invalidDocIdMessage(response) {
    return response.status(400).send({
      message: 'Invalid document ID. Please enter a valid ID'
    });
  }

  /**
   * @description
   * @param {any} res
   * @returns {object} response
   * @memberof Helpers
   */
  static invalidUserIdMessage(response) {
    return response.status(400).send({
      message: 'Invalid user ID. Please enter a valid ID'
    });
  }

  /**
   * Get errors
   * @param {Array} error client side errors
   * @returns {Array} return user's attributes
   */
  static errorReporter(error) {
    const errorReport = [];
    error.errors.forEach((err) => {
      errorReport.push({ path: err.path, message: err.message });
    });
    return errorReport;
  }
}

export default Helpers;
