const User = require('../models').User;
/**
 *
 *
 * @class Helpers
 */
class Helpers {
  /**
   * @description
   * @static
   * @param {any} req
   * @returns {object} User
   * @memberof Helpers
   */
  static createUser(req, res) {
    const user = new User();
    return User.create({
      fullName: req.body.fullName,
      email: req.body.email,
      role: 'user',
      password: req.body.password
    })
      .then((newUser) => {
        const token = user.generateJWT(newUser.id, newUser.role);
        res.status(200).send({
          message: 'User created successfully!',
          user: {
            token,
            id: newUser.id,
            fullname: newUser.fullname,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt
          }
        });
      })
      .catch(error => res.status(401).send(error));
  }
}

export default Helpers;
