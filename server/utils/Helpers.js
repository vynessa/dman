import { User, Document } from '../models';

/**
 * @class Helpers
 */
class Helpers {
  /**
   * @description helper method which creates a user and returns
      a token and a user object
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
        const token = user.generateToken(
          newUser.id,
          newUser.role,
          newUser.fullName);
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
   * @description Helper method which updates a user's profile
      and returns in a new object containing the new profile
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} User
   * @memberof Helpers
   */
  static updateUserHelper(req, res) {
    let hashedPassword;
    const newUser = new User();
    if (req.body.password) {
      hashedPassword = newUser.generateHash(req.body.password);
    }
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
        req.body.password = hashedPassword || user.dataValues.password;
        req.body.role = req.body.role || user.dataValues.role;

        const errorMessage = 'updateUserError';
        const errors = Helpers.formValidator(req, errorMessage);
        if (errors) {
          return res.status(400).send({
            message: 'Error occured while updating User',
            errors: {
              msg: errors[0].msg
            }
          });
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
                fullName: user.fullName,
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
   * @description Helper method which enables a user create
      a document and returns the new document object
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} Document
   * @memberof Helpers
   */
  static createDocumentHelper(req, res) {
    const verifyAccessType = Helpers.verifyAccessType(
      req.decoded.role,
      req.body.accessType
    );
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
   * @description Update a user's document on request by id
      and returns an object with the updated document
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} Document
   * @memberof Helpers
   */
  static updateDocumentHelper(req, res) {
    return Document.findById(Math.abs(req.params.id)).then((document) => {
      if (!document) {
        return res.status(404).send({
          message: 'Sorry, the document does not exist!'
        });
      }
      if (req.body.title.toLowerCase() === document.title.toLowerCase()) {
        return res.status(409).send({
          message: 'Sorry, this title already exists!'
        });
      }
      if (Number(req.decoded.id) === Number(document.userId)) {
        req.body.title = req.body.title || document.title;
        req.body.content = req.body.content || document.content;
        req.body.accessType = req.body.accessType || document.accessType;

        const errorMessage = 'updateDocumentError';
        const errors = Helpers.formValidator(req, errorMessage);
        if (errors) {
          return res.status(400).send({
            message: 'Error occured while updating Document',
            errors: {
              msg: errors[0].msg
            }
          });
        }

        const verifyAccessType = Helpers.verifyAccessType(
          req.decoded.role,
          req.body.accessType
        );
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
      }
      return res.status(403).send({
        message: 'Unauthorized Access ¯¯|_(ツ)_|¯¯'
      });
    });
  }

  /**
   * @description This checks the length of the documents
      array and responds with the appropriate message
   * @static
   * @param {any} res
   * @param {any} documents
   * @param {any} limit
   * @param {any} offset
   * @param {any} totalDocsCount
   * @returns {object} documents
   * @memberof Helpers
   */
  static getDocsHelper(res, documents, limit, offset, totalDocsCount) {
    if (documents.length === 0) {
      return res.status(404).send({
        message: 'No document found!'
      });
    }
    const metaData = Helpers.pagination(
      limit, offset, totalDocsCount, documents);
    return res.status(200).send({
      message: `Number of documents found: ${totalDocsCount}`,
      documents,
      metaData
    });
  }

  /**
   * @description Validates any route which requires and id
      for the correct id type (integer)
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
   * @description This filters any string by first
      trimming, checking for special characters and
      then converts to lowercase
   * @static
   * @param {string} str
   * @returns {string} str
   * @memberof Helpers
   */
  static stringFilter(str) {
    return str.trim().replace(/([^a-z A-Z 0-9]+)/g, '').toLowerCase();
  }

  /**
   * @description This verifies the access type passed in
      by a user when creating a document
   * @static
   * @param {string} role
   * @param {string} accessType
   * @returns {boolean} true or false
   * @memberof Helpers
   */
  static verifyAccessType(role, accessType) {
    if (accessType === role
      || accessType === 'public'
      || accessType === 'private') {
      return true;
    }
    return false;
  }

  /**
   * @description This enables the user set a limit to
      the number of records to be viewed per page
   * @static
   * @param {int} limit
   * @param {int} offset
   * @param {int} totalCount
   * @param {object} item
   * @returns {object} metaData
   * @memberof Helpers
   */
  static pagination(limit, offset, totalCount, item) {
    let pageCount = Math.round(totalCount / limit);
    pageCount = (pageCount < 1 && totalCount > 0) ? 1 : pageCount;
    const page = Math.round(offset / limit) + 1;
    const metaData = {
      page,
      pageCount,
      count: item.length,
      totalCount,
    };
    return metaData;
  }

  /**
   * @description Verifies if the limit and offset
      is of type int
   * @static
   * @param {int} limit
   * @param {int} offset
   * @param {object} response
   * @returns {object} response
   * @memberof Helpers
   */
  static limitAndOffsetValidator(limit, offset, response) {
    if (!Number.isInteger(Number(limit))
      || !Number.isInteger(Number(offset))) {
      return response.status(400).send({
        message: 'Please set the limit and offset as an integer'
      });
    }
  }

  /**
   * @description Verifies that every field in the body
      of a form has the accurate data type and has content
   * @static
   * @param {any} req
   * @param {any} errorMessage
   * @returns {object} errors
   * @memberof Helpers
   */
  static formValidator(req, errorMessage) {
    if (errorMessage === 'createUserError'
       || errorMessage === 'updateUserError') {
      req.checkBody('fullName', 'Fullname is Required').notEmpty();
      req.checkBody('email', 'An email is required').notEmpty();
      req.checkBody('email', 'Invalid email address!').isEmail();
      req.checkBody('password', 'Please enter a password').notEmpty();
      req.checkBody('password', 'Password must contain at least 7 characters')
        .isLength({ min: 7 });
    }
    if (errorMessage === 'loginError') {
      req.checkBody('email', 'Invalid email address!').isEmail();
      req.checkBody('email', 'An email address is required').notEmpty();
      req.checkBody('password', 'Please enter a password').notEmpty();
    }
    if (errorMessage === 'createDocumentError'
       || errorMessage === 'updateDocumentError') {
      req.checkBody('title', 'Please enter a title').notEmpty();
      req.checkBody('content', 'Please enter content here!').notEmpty();
      req.checkBody('accessType', 'Access Type must be alphanumeric').isAlpha();
      req.checkBody('accessType', 'Please enter an Access Type').notEmpty();
    }
    const errors = req.validationErrors();
    return errors;
  }

  /**
   * @description Search query for the users controller
   * @static
   * @param {any} req
   * @returns {object} query
   * @memberof Helpers
   */
  static userSearchQuery(req) {
    const searchString = Helpers.stringFilter(req.query.q);
    const query = {
      where: {
        $or: [
          {
            fullName: {
              $ilike: `%${searchString}%`
            }
          },
          {
            email: {
              $ilike: `%${searchString}%`
            }
          }
        ]
      },
      attributes: ['id', 'fullName', 'role', 'createdAt']
    };
    return query;
  }

  /**
   * @description Search query for the documents controller
   * @static
   * @param {any} req
   * @param {any} role
   * @returns {object} query
   * @memberof Helpers
   */
  static documentSearchQuery(req, role) {
    const searchString = Helpers.stringFilter(req.query.q);
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
