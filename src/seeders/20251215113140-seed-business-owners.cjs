'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add seed commands here.
         * Create business owners with businesses and branches
         */

        // First, create users in the users table
        const businessOwnerUsers = [
            {
                email: "restaurant.owner@example.com",
                is_super_admin: false,
                phone_number: "+1987654321",
                country_code: "+1",
                iso_code: "US",
                updated_by: "system",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                email: "retail.store@example.com",
                is_super_admin: false,
                phone_number: "+1987654322",
                country_code: "+1",
                iso_code: "US",
                updated_by: "system",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                email: "fitness.gym@example.com",
                is_super_admin: false,
                phone_number: "+1987654323",
                country_code: "+1",
                iso_code: "US",
                updated_by: "system",
                created_at: new Date(),
                updated_at: new Date(),
            }
        ];

        const createdUsers = await queryInterface.bulkInsert("users", businessOwnerUsers, { returning: true });

        // Get the business_owner role ID
        const roles = await queryInterface.sequelize.query(
            "SELECT id FROM roles WHERE name = 'business_owner'",
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (roles.length === 0) {
            throw new Error('Business owner role not found. Please run the roles seeder first.');
        }

        const businessOwnerRoleId = roles[0].id;

        // Create user role entries with business_owner role
        const businessOwnerData = [
            {
                user_id: createdUsers[0].id,
                role_id: businessOwnerRoleId,
                first_name: "Mario",
                last_name: "Rossi",
                password: "business123",
                is_verify: true,
                is_blocked: false,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                user_id: createdUsers[1].id,
                role_id: businessOwnerRoleId,
                first_name: "Lisa",
                last_name: "Anderson",
                password: "business123",
                is_verify: true,
                is_blocked: false,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                user_id: createdUsers[2].id,
                role_id: businessOwnerRoleId,
                first_name: "Chris",
                last_name: "Martinez",
                password: "business123",
                is_verify: true,
                is_blocked: false,
                created_at: new Date(),
                updated_at: new Date(),
            }
        ];

        await queryInterface.bulkInsert("user_roles", businessOwnerData, {});

        // Create businesses
        const businesses = [
            {
                business_name: "Mario's Italian Restaurant",
                user_id: createdUsers[0].id,
                updated_by: null,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                business_name: "Anderson's Fashion Store",
                user_id: createdUsers[1].id,
                updated_by: null,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                business_name: "FitLife Gym & Wellness Center",
                user_id: createdUsers[2].id,
                updated_by: null,
                created_at: new Date(),
                updated_at: new Date(),
            }
        ];

        const createdBusinesses = await queryInterface.bulkInsert("businesses", businesses, { returning: true });

        // Create branches
        const branches = [
            {
                business_id: createdBusinesses[0].id,
                branch_name: "Main Location",
                phone_number: "+1987654321",
                country_code: "+1",
                iso_code: "US",
                latitude: "40.7128",
                longitude: "-74.0060",
                contact_name: "Mario Rossi",
                location: "123 Italian Blvd, New York, NY 10001",
                city: "New York",
                updated_by: null,
                status: "active",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                business_id: createdBusinesses[1].id,
                branch_name: "Downtown Store",
                phone_number: "+1987654322",
                country_code: "+1",
                iso_code: "US",
                latitude: "34.0522",
                longitude: "-118.2437",
                contact_name: "Lisa Anderson",
                location: "456 Fashion Ave, Los Angeles, CA 90001",
                city: "Los Angeles",
                updated_by: null,
                status: "active",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                business_id: createdBusinesses[2].id,
                branch_name: "Main Gym",
                phone_number: "+1987654323",
                country_code: "+1",
                iso_code: "US",
                latitude: "41.8781",
                longitude: "-87.6298",
                contact_name: "Chris Martinez",
                location: "789 Fitness St, Chicago, IL 60601",
                city: "Chicago",
                updated_by: null,
                status: "active",
                created_at: new Date(),
                updated_at: new Date(),
            },
            // Additional branches for some businesses
            {
                business_id: createdBusinesses[0].id,
                branch_name: "Brooklyn Branch",
                phone_number: "+1987654324",
                country_code: "+1",
                iso_code: "US",
                latitude: "40.6782",
                longitude: "-73.9442",
                contact_name: "Mario Rossi",
                location: "321 Brooklyn Ave, Brooklyn, NY 11201",
                city: "Brooklyn",
                updated_by: null,
                status: "active",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                business_id: createdBusinesses[2].id,
                branch_name: "Westside Location",
                phone_number: "+1987654325",
                country_code: "+1",
                iso_code: "US",
                latitude: "41.8781",
                longitude: "-87.6298",
                contact_name: "Chris Martinez",
                location: "654 Westside Dr, Chicago, IL 60602",
                city: "Chicago",
                updated_by: null,
                status: "active",
                created_at: new Date(),
                updated_at: new Date(),
            }
        ];

        await queryInterface.bulkInsert("branches", branches, {});
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         * Remove business owners, their businesses and branches
         */

        try {
            // Get business owner users
            const businessOwnerUsers = await queryInterface.sequelize.query(
                "SELECT id FROM users WHERE email LIKE '%@example.com' AND is_super_admin = false",
                { type: queryInterface.sequelize.QueryTypes.SELECT }
            );

            if (businessOwnerUsers.length > 0) {
                const userIds = businessOwnerUsers.map(user => user.id);

                // Get businesses for these users
                const businesses = await queryInterface.sequelize.query(
                    `SELECT id FROM businesses WHERE user_id IN (${userIds.join(',')})`,
                    { type: queryInterface.sequelize.QueryTypes.SELECT }
                );

                if (businesses.length > 0) {
                    const businessIds = businesses.map(business => business.id);

                    // Delete branches
                    await queryInterface.bulkDelete("branches", { business_id: businessIds }, {});

                    // Delete businesses
                    await queryInterface.bulkDelete("businesses", { id: businessIds }, {});
                }

                // Delete from user_roles first (due to foreign key constraints)
                await queryInterface.bulkDelete("user_roles", { user_id: userIds }, {});

                // Then delete from users
                await queryInterface.bulkDelete("users", { id: userIds }, {});
            }
        } catch (error) {
            console.error('Error in down migration:', error);
            throw error;
        }
    }
};