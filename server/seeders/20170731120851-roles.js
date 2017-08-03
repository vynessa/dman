'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Roles',
      [{
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        role: 'editor',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Roles', null, {});
  }
};
