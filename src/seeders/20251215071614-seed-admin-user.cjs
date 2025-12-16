'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add seed commands here.
         * Create admin user
         */

        // First, create the user in the users table
        const [user] = await queryInterface.bulkInsert(
            "users",
            [
                {
                    email: "admin@yopmail.com",
                    is_super_admin: true,
                    phone_number: "+1234567890",
                    country_code: "+1",
                    iso_code: "US",
                    updated_by: "system",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { returning: true }
        );

        // Get the admin role ID
        const roles = await queryInterface.sequelize.query(
            "SELECT id FROM roles WHERE name = 'admin'",
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (roles.length === 0) {
            throw new Error('Admin role not found. Please run the roles seeder first.');
        }

        const adminRoleId = roles[0].id;

        // Create the user role entry with admin role
        await queryInterface.bulkInsert(
            "user_roles",
            [
                {
                    user_id: user.id,
                    role_id: adminRoleId,
                    first_name: "Admin",
                    last_name: "User",
                    password: "admin@123", // This will be hashed by the model hooks
                    is_verify: true,
                    is_blocked: false,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            {}
        );
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         * Remove admin user
         */

        // Get the admin user
        const adminUsers = await queryInterface.sequelize.query(
            "SELECT id FROM users WHERE email = 'admin@example.com'",
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (adminUsers.length > 0) {
            const adminUserId = adminUsers[0].id;

            // Delete from user_roles first (due to foreign key constraints)
            await queryInterface.bulkDelete("user_roles", { user_id: adminUserId }, {});

            // Then delete from users
            await queryInterface.bulkDelete("users", { id: adminUserId }, {});
        }
    }
};