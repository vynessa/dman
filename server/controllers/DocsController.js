import Helpers from '../utils/Helpers';
import { Document } from '../models';

/**
 * @class DocsController
 */
class DocsController {
  /**
   * @description Registered and signed in users can create documents
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
        message: 'Error occured while creating Document',
        errors: {
          msg: errors[0].msg
        }
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
   * @description Users can get any document that matches
   *  their role or access type
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} Document
   * @memberof DocsController
   */
  static getDocuments(req, res) {
    if (req.query.limit || req.query.offset) {
      return Helpers.limitAndOffsetValidator(
        req.query.limit,
        req.query.offset,
        res
      );
    }

    /**
     * @description Query object which returns documents based on a user's id,
     * role and document accesstype. For users with role 'user', only that
     * user's documents, and documents with access type 'user' or 'public'
     * are returned. Admin users have access to all documents
     * @function
     * @returns {object} query
     */
    const accessTypeQuery = () => {
      const query = {
        attributes: [
          'id', 'title', 'content',
          'owner', 'accessType',
          'createdAt'
        ]
      };

      if (req.decoded.role !== 'admin') {
        query.where = {
          $or: [
            {
              userId: req.decoded.id
            },
            {
              accessType: [req.decoded.role, 'public']
            }
          ]
        };
        return query;
      }
      return query;
    };

    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;

    return Document.findAll(accessTypeQuery())
    .then((documents) => {
      const totalDocsCount = documents.length;
      Helpers.getDocsHelper(
       res, documents,
       limit, offset, totalDocsCount
      );
    })
    .catch(error => res.status(500).send(error));
  }

  /**
   * @description Users can find documents by id, matching with theirs
      while an admin can find any document inclusive of theirs.
   * @static
   * @param {any} req
   * @param {any} res
   * @returns {object} Document
   * @memberof DocsController
   */
  static findDocument(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return Helpers.idValidator(res);
    }
    return Document.findById(Math.abs(req.params.id))
      .then((document) => {
        if (!document) {
          return res.status(404).send({
            message: 'This document does not exist!'
          });
        }
        if (req.decoded.role === 'admin'
          || Number(req.decoded.id) === Number(document.userId)
          ) {
          return res.status(200).send({
            message: 'Document found!', document
          });
        }
        return res.status(403).send({
          message: 'Unauthorized access! ¯¯|_(ツ)_|¯¯'
        });
      })
      .catch(error => res.status(500).send(error));
  }

  /**
   * @description Users can only update (a) document(s)
      that matches their id
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} Document
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
   * @description Users can delete documents matching their id
      while an admin can delete ant document
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} response
   * @memberof DocsController
   */
  static deleteDocument(req, res) {
    if (!Number.isInteger(Number(req.params.id))) {
      return Helpers.idValidator(res);
    }
    return Document.findById(Math.abs(req.params.id))
      .then((document) => {
        if (!document) {
          return res.status(404).send({
            message: 'Document not found! :('
          });
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
          .catch(error => res.status(400).send(error));
        }
        return res.status(403).send({
          message: 'Unauthorized access! Only an admin can delete a document.'
        });
      })
      .catch(error => res.status(500).send(error));
  }

  /**
   * @description Enables users search through their documents
      while an admin can search through all documents
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} Document
   * @memberof DocsController
   */
  static searchDocuments(req, res) {
    const query = Helpers.documentSearchQuery(req, req.decoded.role);

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
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;

    return Document.findAll(query).then((document) => {
      if (document.length === 0) {
        return res.status(404).send({
          message: 'This document does not exist!'
        });
      }
      const totalDocsCount = document.length;
      const metaData = Helpers.pagination(
        limit, offset,
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
