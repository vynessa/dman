/**
 * @description valueChecker: Checks for any JSON error
 * and returns a message
 *
 * @param {object} error Error object
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 * @param {object} next next function
 *
 * @returns {object} response
 */
const valueChecker = ((error, req, res, next) => {
  if (error && error.toString().indexOf('JSON') > -1) {
    return res.status(400).send({
      message: 'Sorry, an invalid JSON value found :(', error: error.body
    });
  }
  next();
});

export default valueChecker;
