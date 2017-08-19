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
  if (req.url.startsWith('/users/auth') || req.url === '/') return next();
  if (!req.headers.authorization) {
    return res.status(400).json({
      message: 'Please set token in the header!'
    });
  }
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(400).json({
          message: 'Invalid token. Please login :)'
        });
      }
      req.decoded = decoded;
      next();
    });
  } else {
    return res.status(400).json({
      message: 'Please provide a token!'
    });
  }
};

export default verifyToken;
