'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("notification_users", "redirect_url", {
      type: Sequelize.STRING,
      allowNull: true,      // URL can be null
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("notification_users", "redirect_url");
  }
};
