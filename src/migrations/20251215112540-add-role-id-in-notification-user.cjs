'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('notification_users', 'role_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'roles', // roles table
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('notification_users', 'role_id');
  }
};
