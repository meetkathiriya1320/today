'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add seed commands here.
         * Create regular users with 'user' role
         */

        const users = [
            {
                email: "john.doe@example.com",
                is_super_admin: false,
                phone_number: "+1234567891",
                country_code: "+1",
                iso_code: "US",
                updated_by: "system",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                email: "jane.smith@example.com",
                is_super_admin: false,
                phone_number: "+1234567892",
                country_code: "+1",
                iso_code: "US",
                updated_by: "system",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                email: "mike.wilson@example.com",
                is_super_admin: false,
                phone_number: "+1234567893",
                country_code: "+1",
                iso_code: "US",
                updated_by: "system",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                email: "sarah.johnson@example.com",
                is_super_admin: false,
                phone_number: "+1234567894",
                country_code: "+1",
                iso_code: "US",
                updated_by: "system",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                email: "david.brown@example.com",
                is_super_admin: false,
                phone_number: "+1234567895",
                country_code: "+1",
                iso_code: "US",
                updated_by: "system",
                created_at: new Date(),
                updated_at: new Date(),
            }
        ];

        const createdUsers = await queryInterface.bulkInsert("users", users, { returning: true });

        // Get the user role ID
        const roles = await queryInterface.sequelize.query(
            "SELECT id FROM roles WHERE name = 'user'",
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (roles.length === 0) {
            throw new Error('User role not found. Please run the roles seeder first.');
        }

        const userRoleId = roles[0].id;

        // Create user role entries with user role
        const userRoles = createdUsers.map((user, index) => {
            const firstNames = ["John", "Jane", "Mike", "Sarah", "David"];
            const lastNames = ["Doe", "Smith", "Wilson", "Johnson", "Brown"];

            return {
                user_id: user.id,
                role_id: userRoleId,
                first_name: firstNames[index],
                last_name: lastNames[index],
                password: "user123", // This will be hashed by the model hooks
                is_verify: true,
                is_blocked: false,
                created_at: new Date(),
                updated_at: new Date(),
            };
        });

        await queryInterface.bulkInsert("user_roles", userRoles, {});
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         * Remove regular users
         */

        // Get the regular users
        const regularUsers = await queryInterface.sequelize.query(
            "SELECT id FROM users WHERE email LIKE '%@example.com' AND is_super_admin = false",
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (regularUsers.length > 0) {
            const userIds = regularUsers.map(user => user.id);

            // Delete from user_roles first (due to foreign key constraints)
            await queryInterface.bulkDelete("user_roles", { user_id: userIds }, {});

            // Then delete from users
            await queryInterface.bulkDelete("users", { id: userIds }, {});
        }
    }
};