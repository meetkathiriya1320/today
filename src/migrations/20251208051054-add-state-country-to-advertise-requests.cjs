'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn("advertise_requests", "state", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("advertise_requests", "country", {
        type: Sequelize.STRING,
        allowNull: true,
      })
    ])
  },

  async down(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.removeColumn("advertise_requests", "state"),
      queryInterface.removeColumn("advertise_requests", "country")
    ])
  }
};
