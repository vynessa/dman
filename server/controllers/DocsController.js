import Helpers from '../utils/Helpers';
import Utils from '../utils/Utils';
import { Document } from '../models';

/**
 * @class DocsController
 */
class DocsController {
  /**
   * @description Registered and signed in users can create documents
   *
   * @static
   *
   * @param {object} req HTTP request object
   * @param {object} res HTTP response object
   *
   * @returns {object} Document
   *
   * @memberof DocsController
   */
  static createDocument(req, res) {
    const errorMessage = 'createDocumentError';
    const errors = Helpers.formValidator(req, errorMessage);
    if (errors) {
      return res.status(400).send({
        message: 'Error occured while creating Document',
        errors: {
          message: errors[0].msg
        }
      });
    }
    Document.findOne({
      where: {
        title: req.body.title
      }
    })
      .then((document) => {
        if (!document) {
          return Helpers.createDocumentHelper(req, res);
        }
        return Utils.docConflictMessage(res);
      })
      .catch(error => res.status(500).send(error));
  }

  /**
   * @description Users can get any document that matches
   * their role or access type
   *
   * @static
   *
   * @param {object} req HTTP request object
   * @param {object} res HTTP response object
   *
   * @returns {object} Document
   *
   * @memberof DocsController
   */
  static getDocuments(req, res) {
    const query = Utils.accessTypeQuery(req, res);
    if (!query) return false;
    return Document.findAll(query)
    .then((documents) => {
      const totalDocsCount = documents.length;
      Helpers.getDocsHelper(
       res, documents,
       query.limit, query.offset, totalDocsCount
      );
    })
    .catch(error => res.status(500).send(error));
  }

  /**
   * @description Users can find documents by id, matching with theirs
   * while an admin can find any document inclusive of theirs.
   *
   * @static
   *
   * @param {object} req HTTP request object
   * @param {object} res HTTP response object
   *
   * @returns {object} Document
   *
   * @memberof DocsController
   */
  static findDocument(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return Helpers.idValidator(res);
    }
    const query = Utils.findDocumentQuery(req, res);
    return Document.findOne(query)
      .then((document) => {
        if (!document) {
          return Utils.emptyDocResponse(res);
        }
        if (req.decoded.role === 'user'
          && (document.userId !== Number(req.decoded.id)
            && (document.accessType === 'admin'
            || document.accessType === 'private'))) {
          return res.status(403).send({
            message: 'Unauthorized access! ¯¯|_(ツ)_|¯¯'
          });
        }
        return res.status(200).send({
          message: 'Document found!', document
        });
      })
      .catch(error => res.status(500).send(error));
  }

  /**
   * @description Users can only update (a) document(s)
   * that matches their id
   *
   * @static
   *
   * @param {object} req HTTP request object
   * @param {object} res HTTP response object
   *
   * @returns {object} Document
   *
   * @memberof DocsController
   */
  static updateDocument(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return Helpers.idValidator(res);
    }
    return Helpers.updateDocumentHelper(req, res);
  }

  /**
   * @description Users can delete documents matching their id
   * while an admin can delete ant document
   *
   * @static
   *
   * @param {object} req HTTP request object
   * @param {object} res HTTP response object
   *
   * @returns {object} response
   *
   * @memberof DocsController
   */
  static deleteDocument(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return Helpers.idValidator(res);
    }
    return Document.findById(Math.abs(req.params.id))
      .then((document) => {
        if (!document) {
          return Utils.emptyDocResponse(res);
        }
        if (req.decoded.role === 'admin'
          || Number(req.decoded.id) === Number(document.userId)
        ) {
          return document
          .destroy()
          .then(() =>
            res.status(200).send({
              message: 'Document deleted successfully!'
            })
          )
          .catch(error => res.status(500).send(error));
        }
        return res.status(403).send({
          message: 'Unauthorized access! ¯¯|_(ツ)_|¯¯'
        });
      })
      .catch(error => res.status(500).send(error));
  }

  /**
   * @description Enables users search through their documents
   * while an admin can search through all documents
   *
   * @static
   *
   * @param {object} req HTTP request object
   * @param {object} res HTTP response object
   *
   * @returns {object} Document
   *
   * @memberof DocsController
   */
  static searchDocuments(req, res) {
    if (!req.query.q) {
      return res.status(400).send({
        message: 'Please enter a keyword'
      });
    }
    const query = Helpers.documentSearchQuery(req, res, req.decoded.role);
    if (!query) return false;
    return Document.findAll(query).then((document) => {
      if (document.length === 0) {
        return Utils.emptyDocResponse(res);
      }
      const totalDocsCount = document.length;
      const metaData = Helpers.pagination(
        query.limit, query.offset,
        totalDocsCount, document
      );
      return res.status(200).send({
        message: `Number of documents found: ${totalDocsCount}`,
        document,
        metaData
      });
    })
    .catch(error => res.status(500).send(error));
  }
}

export default DocsController;
