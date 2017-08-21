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
   * @param {object} req
   * @param {object} res
   * @returns {object} User
   * @memberof Helpers
   */
  static createUserHelper(req, res) {
    const user = new User();
    return User.create({
      fullName: req.body.fullName,
      email: req.body.email,
      role: 'user',
      password: user.generateHash(req.body.password)
    })
      .then((newUser) => {
        const token = user.generateToken(newUser.id, newUser.role, newUser.fullName);
        res.status(201).send({
          token,
          user: {
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
   * @param {object} req
   * @param {object} res
   * @returns {object} user
   * @memberof Helpers
   */
  static updateUserHelper(req, res) {
    return User.findById(Math.abs(req.params.id)).then((user) => {
      if (!user) {
        return res.status(404).send({
          message: 'Sorry, the user does not exist!'
        });
      }
      if (req.body.email === user.email) {
        return res.status(409).send({
          message: 'This email already exists!'
        });
      }
      if (Number(req.decoded.id) !== Number(req.params.id)) {
        return res.status(401).send({
          message: 'Unauthorized access ¯¯|_(ツ)_|¯¯'
        });
      }
      return user
        .update(req.body, { fields: Object.keys(req.body) })
        .then(() =>
          res.status(200).send({
            message: 'Profile successfully updated',
            user: {
              name: user.fullName,
              email: user.email,
              id: user.id,
              role: user.role
            }
          })
        )
        .catch((error) => {
          if (error.parent.code === '23505') {
            res.status(409).send(error);
          }
          res.status(400).send(error);
        });
    });
  }

  /**
   * @description
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} Document
   * @memberof Helpers
   */
  static createDocumentHelper(req, res) {
    return Document.create({
      title: req.body.title,
      content: req.body.content,
      owner: req.decoded.fullName,
      accessType: req.body.accessType,
      userId: req.body.userId
    })
      .then(document =>
        res.status(201).send({
          message: 'Document created successfully',
          document: {
            title: document.title,
            content: document.content,
            owner: document.owner,
            documentId: document.id,
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
   * @param {object} req
   * @param {object} res
   * @returns {object} document
   * @memberof Helpers
   */
  static updateDocumentHelper(req, res) {
    return Document.findById(Math.abs(req.params.id)).then((document) => {
      if (!document) {
        return res.status(404).send({
          message: 'Sorry, the document does not exist!'
        });
      }
      if (Number(req.decoded.id) !== Number(req.params.id)) {
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
      }
      return res.status(401).send({
        message: 'Unauthorized Access ¯¯|_(ツ)_|¯¯'
      });
    });
  }

  /**
   * @description
   * @param {object} response
   * @returns {object} response
   * @memberof Helpers
   */
  static idValidator(response) {
    return response.status(400).send({
      message: 'Invalid ID. Please enter a valid ID'
    });
  }

  /**
   * @description
   * @static
   * @param {string} str
   * @returns {string} str
   * @memberof Helpers
   */
  static stringFilter(str) {
    return str.trim().replace(/([^a-z A-Z 0-9]+)/g, '').toLowerCase();
  }
}

export default Helpers;
