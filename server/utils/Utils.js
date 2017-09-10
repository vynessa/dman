import Helpers from '../utils/Helpers';
/**
 * @class Utils
 */
class Utils {
  /**
   * @description Response object to handle title conflicts
   *
   * @static
   *
   * @param {object} res HTTP response object
   *
   * @returns {object} Response
   *
   * @memberof Utils
   */
  static docConflictMessage(res) {
    return res.status(409).send({
      message: 'Oops! A document with this title already exists!'
    });
  }

  /**
   * @description Response object to handle conflicts
   *
   * @static
   *
   * @param {object} res HTTP response object
   *
   * @returns {object} Response
   *
   * @memberof Utils
   */
  static emailConflictResponse(res) {
    return res.status(409).send({
      message: 'This email already exists!'
    });
  }

  /**
   * @description Non-existing document response
   *
   * @static
   *
   * @param {object} res HTTP response object
   *
   * @returns {object} Response
   *
   * @memberof Utils
   */
  static emptyDocResponse(res) {
    return res.status(404).send({
      message: 'Sorry, this document does not exist!'
    });
  }

  /**
   * @description Non-existing user response
   *
   * @static
   *
   * @param {object} res HTTP response object
   *
   * @returns {object} Response
   *
   * @memberof Utils
   */
  static noUserResponse(res) {
    return res.status(404).send({
      message: 'Sorry, the user does not exist!'
    });
  }

  /**
   * @description Query object which returns documents based on a user's id,
   * role and document accesstype. For users with role 'user', only that
   * user's document(s), and documents with access type 'user' or 'public'
   * are returned. Admin users have access to all documents
   *
   * @static
   *
   * @param {object} req HTTP request object
   * @param {object} res HTTP response object
   *
   * @returns {object} query
   *
   * @memberof Utils
   */
  static accessTypeQuery(req, res) {
    const { limit, offset } = Helpers.limitAndOffsetValidator(
      req.query.limit,
      req.query.offset,
      res
    );
    if (!limit) return false;
    const query = {
      limit,
      offset,
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
  }

  /**
   * @description Queries the database based on the user's access level
   *
   * @static
   *
   * @param {object} req HTTP request object
   *
   * @returns {object} query
   *
   * @memberof Utils
   */
  static findDocumentQuery(req) {
    const query = {
      attributes: [
        'id', 'title', 'content', 'userId',
        'owner', 'accessType',
        'createdAt'
      ]
    };

    if (req.decoded.role !== 'admin') {
      query.where = {
        $and: [
          {
            userId: req.decoded.id
          },
          {
            id: req.params.id
          },
          {
            accessType: [req.decoded.role, 'user', 'public']
          }
        ]
      };
    }
    query.where = {
      $and: [
        {
          id: req.params.id
        },
        {
          accessType: [req.decoded.role, 'user', 'public', 'private']
        }
      ]
    };
    return query;
  }
}

export default Utils;
