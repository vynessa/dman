import jwt from 'jsonwebtoken';
/**
  * verifyToken: This verifies all routes that starts with /api
  *  It checks if there is token and checks if the token is valid
  *  if the token is valid then it decodes it and send to the next routes
  * @function verifyToken
  * @param {object} req
  * @param {object} res
  * @param {object} next
  * @return {object} - returns response status and json data
  */
const verifyToken = (req, res, next) => {
  // checking for token
  if (req.url.startsWith('/users/auth')) return next();
  if (!req.headers.authorization) {
    return res.status(400).json({
      message: 'Please Set Token in the Header'
    });
  }
  const token = req.headers.authorization;
  // decoding the token
  if (token) {
    // verifies secret and checks
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(400).json({
          message: 'Token not valid Please login'
        });
      }
      // request user detail for other routes
      req.decoded = decoded;
      next();
    });
  }
  return res.status(401).json({
    message: 'Empty Token'
  });
};

export default verifyToken;
