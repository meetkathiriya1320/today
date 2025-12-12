'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('offers', 'is_blocked', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        });
        await queryInterface.addColumn('offers', 'blocked_reason', {
            type: Sequelize.TEXT,
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('offers', 'blocked_reason');
        await queryInterface.removeColumn('offers', 'is_blocked');
    }
};