'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('advertise_banners', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            request_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'advertise_requests',
                    key: 'id'
                }
            },
            status: {
                type: Sequelize.ENUM('pending', 'approved', 'rejected', 'active', 'inactive'),
                allowNull: false,
                defaultValue: 'pending'
            },
            note: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            create_by: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            updated_by: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
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
        await queryInterface.dropTable('advertise_banners');
    }
};