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
   * @param {any} res
   * @returns {object} response
   * @memberof Helpers
   */
  static invalidDocIdMessage(res) {
    return res.status(400).send({
      message: 'Invalid document ID. Please enter a valid ID'
    });
  }

  /**
   * @description
   * @param {any} res
   * @returns {object} response
   * @memberof Helpers
   */
  static invalidUserIdMessage(res) {
    return res.status(400).send({
      message: 'Invalid user ID. Please enter a valid ID'
    });
  }
}

export default Helpers;
