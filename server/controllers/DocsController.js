import Helpers from '../utils/helper';
import { Document } from '../models';

/**
 * @class DocsController
 */
class DocsController {
  /**
   * @description
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} Document
   * @memberof DocsController
   */
  static createDocument(req, res) {
    const errorMessage = 'createDocumentError';
    const errors = Helpers.formValidator(req, errorMessage);
    if (errors) {
      return res.status(400).send({
        message: 'Error occured while creating Document', errors
      });
    }
    Document.find({
      where: {
        title: req.body.title
      }
    })
      .then((document) => {
        if (!document) {
          return Helpers.createDocumentHelper(req, res);
        }
        return res.status(409).send({
          message: 'Oops! A document with this title already exists!'
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
   * @memberof DocsController
   */
  static getDocuments(req, res) {
    const query = {
      where: {
        accessType: [req.decoded.role, 'public']
      }
    };
    if (req.decoded.role === 'admin') {
      return Document.findAll()
        .then(documents => Helpers.getDocsHelper(res, documents))
        .catch(error => res.status(500).send(error));
    }
    Document.findAll(query)
      .then(documents => Helpers.getDocsHelper(res, documents))
      .catch(error => res.status(500).send(error));
  }

  /**
   * @description
   * @static
   * @param {any} req
   * @param {any} res
   * @returns {object} document
   * @memberof DocsController
   */
  static findDocument(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return Helpers.idValidator(res);
    }
    if (Number(req.decoded.id) === Number(req.params.id)
        || req.decoded.role === 'admin') {
      return Document.findById(req.params.id)
        .then((document) => {
          if (!document) {
            return res.status(404).send({
              message: 'This document does not exist!'
            });
          }
          return res.status(200).send({
            message: 'Document found!', document
          });
        })
        .catch(error => res.status(500).send(error));
    }
    return res.status(403).send({
      message: 'Unauthorized access! ¯¯|_(ツ)_|¯¯'
    });
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
    return Helpers.updateDocumentHelper(req, res).catch(error =>
      res.status(500).send(error)
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
        .catch(error => res.status(500).send(error));
    }
    return res.status(403).send({
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
    const query = Helpers.documentSearchQuery(req, req.decoded.role);
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
      .catch(error => res.status(500).send(error));
  }
}

export default DocsController;
