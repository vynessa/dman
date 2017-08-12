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
      .then(documents => res.status(200).send(documents))
      .catch(error => res.status(401).send(error));
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
      return res.status(400).send({
        message: 'Invalid document ID. Please enter a valid ID'
      });
    }
    // if (req.body.password) {
    //   const user = new User();
    //   req.body.password = user.generateHash(req.body.password);
    // }
    return Document.findById(req.params.id)
      .then((document) => {
        // if (req.body.role) {
        //   if (req.decoded.role !== 'admin') {
        //     return res.status(401).send({
        //       message: 'Unauthorized Access! Only Admin can Update Role'
        //     });
        //   }
        // }
        if (!document) {
          return res.status(400).send({
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
      })
      .catch(error => res.status(401).send(error));
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
      return res.status(400).send({
        message: 'Invalid document ID. Please enter a valid ID'
      });
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
        .catch(error => res.status(400).send(error));
    }
    return res.status(401).send({
      message: 'Unauthorized access! Only an admin can delete a document.'
    });
  }
}

export default DocsController;
