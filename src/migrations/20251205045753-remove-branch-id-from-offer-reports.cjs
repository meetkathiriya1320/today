'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('offer_reports', 'branch_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('offer_reports', 'branch_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};
