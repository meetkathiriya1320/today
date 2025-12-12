'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('advertise_requests', 'latitude', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true,       // <-- allow NULL
      defaultValue: null     // <-- set default NULL
    });

    await queryInterface.changeColumn('advertise_requests', 'longitude', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,       // <-- allow NULL
      defaultValue: null     // <-- set default NULL
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('advertise_requests', 'latitude', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: false
    });

    await queryInterface.changeColumn('advertise_requests', 'longitude', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: false
    });
  }
};
