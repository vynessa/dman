// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';


module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  });

  // User.prototype.generateHash = (password) => {
  //   return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  // };

  // User.prototype.validatePassword = (password, savedPassword) => {
  //   return bcrypt.compareSync(password, savedPassword);
  // };

  // User.prototype.generateJWT = (id, email, name, role) => {
  //   return jwt.sign({
  //     id,
  //     email,
  //     name,
  //     role,
  //   }, process.env.JWT_SECRET, { expiresIn: '24h' });
  // };

  User.associate = (models) => {
    User.hasMany(models.Document, {
      foreignKey: 'userId',
      as: 'myDocuments',
    });
  };
  return User;
};
