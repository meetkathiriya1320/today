'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      payment_method: {
        type: Sequelize.ENUM('credit_card', 'debit_card', 'bank_transfer', 'check', 'cash', 'online'),
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      check_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ad_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'advertise_banners',
          key: 'id'
        }
      },
      transaction_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      create_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      updated_by: {
        type: Sequelize.INTEGER,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  }
};
