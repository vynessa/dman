/**
 * @class Utils
 */
class Utils {
  /**
   * @description
   * @static
   * @param {object} data
   * @returns {object} metadata
   * @memberof Helpers
   */
  static pagination() {

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

  /**
   * @description
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
}

export default Utils;
