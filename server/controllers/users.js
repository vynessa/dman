import User from './../models/user';

module.exports = {
  // getUser(req, res) {
  //   const vanessa = new User({
  //     fullName: 'Vanessa Ejikeme',
  //     email: 'vanessa.ejikeme@gmail.com',
  //     role: 'user',
  //     password: 'vanessa',
  //     userId: 1
  //   });

  //   vanessa.find((err) => {
  //     if (err) throw err;

  //     console.log('User saved successfully');
  //     res.status(200).json({ success: true });
  //   });
  // },

  getUser(req, res) {
    user.find((err) => {
    });
  },

  createUser() {}
};
