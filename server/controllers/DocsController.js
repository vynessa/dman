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
    if (req.decoded.role !== 'admin') {
      return res.status(401).send({
        message: 'Unauthorized access! All documents can only be viewed by an admin'
      });
    }
    Document.findAll()
      .then((documents) => {
        if (documents.length === 0) {
          return res.status(404).send({
            message: 'No document found!'
          });
        }
        return res.status(200).send(documents);
      })
      .catch(error => res.status(400)
        .send(Helpers.errorReporter(error))
      );
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
    return Helpers.createDocument(req, res);
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
      return Helpers.invalidDocIdMessage(res);
    }
    // if (req.body.password) {
    //   const user = new User();
    //   req.body.password = user.generateHash(req.body.password);
    // }
    return Helpers.updateDocument(req, res)
    .catch(error =>
      res.status(400).send(Helpers.errorReporter(error))
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
      return Helpers.invalidDocIdMessage(res);
    }
    if (
      Number(req.decoded.id) === Number(req.params.userId) ||
      req.decoded.role === 'admin'
    ) {
      return Document.findById(req.params.id)
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
        .catch(error => res.status(400)
          .send(Helpers.errorReporter(error))
        );
    }
    return res.status(401).send({
      message: 'Unauthorized access! Only an admin can delete a document.'
    });
  }
}

export default DocsController;
