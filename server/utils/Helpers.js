import Utils from '../utils/Utils';
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
      if (Number(req.decoded.id) === Number(req.params.id)
          || req.decoded.role === 'admin') {
        req.body.fullName = req.body.fullName || user.dataValues.fullName;
        req.body.email = req.body.email || user.dataValues.email;
        req.body.password = req.body.password || user.dataValues.password;
        req.body.role = req.body.role || user.dataValues.role;

        const errorMessage = 'updateUserError';
        const errors = Helpers.formValidator(req, errorMessage);
        if (errors) {
          return res.status(400).send({ message: 'Error occured while updating User', errors });
        }
        return user
          .update({
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role
          })
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
          .catch(error => res.status(400).send(error));
      }
      return res.status(403).send({
        message: 'Unauthorized access ¯¯|_(ツ)_|¯¯'
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
    const verifyAccessType = Utils.verifyAccessType(req.decoded.role, req.body.accessType);
    if (!verifyAccessType) {
      return res.status(400).send({
        message: 'Invalid Access Type'
      });
    }
    return Document.create({
      title: req.body.title,
      content: req.body.content,
      owner: req.decoded.fullName,
      accessType: req.body.accessType,
      userId: req.decoded.id
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
      if (req.body.title === document.title) {
        return res.status(409).send({
          message: 'Sorry, this title already exists!'
        });
      }
      if (Number(req.decoded.id) !== Number(document.userId)) {
        return res.status(403).send({
          message: 'Unauthorized Access ¯¯|_(ツ)_|¯¯'
        });
      }
      req.body.title = req.body.title || document.dataValues.title;
      req.body.content = req.body.content || document.dataValues.content;
      req.body.accessType = req.body.accessType || document.dataValues.accessType;

      const errorMessage = 'updateDocumentError';
      const errors = Helpers.formValidator(req, errorMessage);
      if (errors) {
        return res.status(400).send({
          message: 'Error occured while updating Document', errors
        });
      }

      const verifyAccessType = Utils.verifyAccessType(req.decoded.role, req.body.accessType);
      if (!verifyAccessType) {
        return res.status(400).send({
          message: 'Invalid Access Type'
        });
      }
      return document
        .update({
          title: req.body.title,
          content: req.body.content,
          accessType: req.body.accessType
        })
        .then(() =>
          res.status(200).send({
            message: 'Document Successfully Updated',
            document: {
              title: document.title,
              content: document.content,
              owner: document.owner,
              accessType: document.accessType,
              updatedAt: document.updatedAt
            }
          })
        )
        .catch(error => res.status(400).send(error));
    });
  }

  /**
   * @description
   * @static
   * @param {object} res
   * @param {object} documents
   * @returns {object} documents
   * @memberof Helpers
   */
  static getDocsHelper(res, documents) {
    if (documents.length === 0) {
      return res.status(404).send({
        message: 'No document found!'
      });
    }
    return res.status(200).send({
      message: `Number of documents found: ${documents.length}`,
      documents
    });
  }

  /**
   * @description
   * @static
   * @param {any} req
   * @param {any} errorMessage
   * @returns {object} error
   * @memberof Helpers
   */
  static formValidator(req, errorMessage) {
    if (errorMessage === 'createUserError'
       || errorMessage === 'updateUserError') {
      req.checkBody('fullName', 'Fullname is Required').notEmpty();
      req.checkBody('email', 'An email is required').notEmpty();
      req.checkBody('email', 'Invalid email address!').isEmail();
      req.checkBody('password', 'Please enter a password').notEmpty();
      req.checkBody('password', 'Password must contain at least 7 characters').len(7, 20);
    }
    if (errorMessage === 'loginError') {
      req.checkBody('email', 'Invalid email address!').isEmail();
      req.checkBody('email', 'An email address is required').notEmpty();
      req.checkBody('password', 'Please enter a password').notEmpty();
    }
    if (errorMessage === 'createDocumentError'
       || errorMessage === 'updateDocumentError') {
      req.checkBody('title', 'Please enter a title').notEmpty();
      req.checkBody('content', 'Empty content. Please enter content here!').notEmpty();
      req.checkBody('accessType', 'Please enter an Access Type').notEmpty();
      req.checkBody('accessType', 'Access Type must be alphanumeric').isAlpha();
    }
    const errors = req.validationErrors();
    return errors;
  }

  /**
   * @description
   * @static
   * @param {any} req
   * @param {any} role
   * @returns {object} search result
   * @memberof Helpers
   */
  static documentSearchQuery(req, role) {
    const searchString = Utils.stringFilter(req.query.q);
    let query;
    if (role === 'admin') {
      query = {
        where: {
          $and: [
            {
              title: {
                $ilike: `%${searchString}%`
              }
            },
            {
              accessType: [req.decoded.role, 'public', 'private']
            }
          ]
        },
        attributes: ['title', 'content', 'id', 'accessType', 'createdAt']
      };
    } else {
      query = {
        where: {
          $and: [
            {
              title: {
                $ilike: `%${searchString}%`
              }
            },
            {
              accessType: [req.decoded.role, 'public']
            }
          ]
        },
        attributes: ['title', 'content', 'id', 'accessType', 'createdAt']
      };
    }
    return query;
  }
}

export default Helpers;
