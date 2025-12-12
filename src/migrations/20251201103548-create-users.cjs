'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_super_admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      country_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      iso_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      updated_by: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('users', ['email'], {
      name: 'users_email_unique_active',
      unique: true,
      where: {
        deleted_at: null
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'users_email_unique_active');
    await queryInterface.dropTable('users');
  }
};
