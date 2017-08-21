import Helpers from '../utils/helper';
import { User, Document } from '../models';

/**
 * @class DocsController
 */
class DocsController {
  /**
   * @description
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {void}
   * @memberof DocsController
   */
  static getDocuments(req, res) {
    Document.findAll()
      .then((documents) => {
        if (documents.length === 0) {
          return res.status(404).send({
            message: 'No document found!'
          });
        }
        return res.status(200).send(documents);
      })
      .catch(error => res.status(400).send(error));
  }

  /**
   * @description
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} Document
   * @memberof DocsController
   */
  static createDocument(req, res) {
    return Helpers.createDocumentHelper(req, res);
  }

  /**
   * @description
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} user
   * @memberof DocsController
   */
  static updateDocument(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return Helpers.idValidator(res);
    }
    return Helpers.updateDocumentHelper(req, res)
    .catch(error =>
      res.status(error)
    );
  }

  /**
   * @description
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} reponse
   * @memberof DocsController
   */
  static deleteDocument(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return Helpers.idValidator(res);
    }
    if (
      Number(req.decoded.id) === Number(req.params.userId) ||
      req.decoded.role === 'admin'
    ) {
      return Document.findById(Math.abs(req.params.id))
        .then((document) => {
          if (document) {
            return document
              .destroy()
              .then(() =>
                res.status(200).send({
                  message: 'Document deleted successfully!'
                })
              )
              .catch(error => res.status(400).send(error));
          }
          return res.status(404).send({
            message: 'Document not found! :('
          });
        })
        .catch(error => res.status(400).send(error));
    }
    return res.status(401).send({
      message: 'Unauthorized access! Only an admin can delete a document.'
    });
  }

  /**
   * @description
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} document
   * @memberof DocsController
   */
  static searchDocuments(req, res) {
    if (!req.query.q) {
      return res.status(400).send({
        message: 'Please enter a keyword'
      });
    }
    const searchString = Helpers.stringFilter(req.query.q);
    let query;
    if (req.decoded.role === 'admin') {
      query = {
        where: {
          $and: [{
            title: {
              $ilike: `%${searchString}%`
            },
          }, {
            accessType: [req.decoded.role, 'public', 'private']
          }]
        },
        attributes: ['title', 'content', 'id', 'accessType', 'createdAt']
      };
    } else {
      query = {
        where: {
          $and: [{
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
    Document.findAll(query)
      .then((document) => {
        const message = 'Document found!';

        if (document[0] === undefined) {
          return res
            .status(404)
            .send({ message: 'This document does not exist!' });
        }
        return res.status(200).send({ message, document });
      })
      .catch(error => res.status(400).send(error));
  }
}

export default DocsController;
