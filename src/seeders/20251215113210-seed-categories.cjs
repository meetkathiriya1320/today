'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add seed commands here.
         * Create sample categories for offers
         */

        const categories = [
            {
                name: "Food & Dining",
                image: null, // No image for now, can be added later
                created_by: 1, // Assuming admin user has ID 1
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Fashion & Clothing",
                image: null,
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Health & Fitness",
                image: null,
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Electronics & Technology",
                image: null,
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Beauty & Personal Care",
                image: null,
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Home & Garden",
                image: null,
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Travel & Tourism",
                image: null,
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Automotive",
                image: null,
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Entertainment",
                image: null,
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Education & Learning",
                image: null,
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Professional Services",
                image: null,
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Sports & Recreation",
                image: null,
                created_by: 1,
                created_at: new Date(),
                updated_at: new Date(),
            }
        ];

        await queryInterface.bulkInsert("categories", categories, {});
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         * Remove sample categories
         */

        const categoryNames = [
            "Food & Dining",
            "Fashion & Clothing",
            "Health & Fitness",
            "Electronics & Technology",
            "Beauty & Personal Care",
            "Home & Garden",
            "Travel & Tourism",
            "Automotive",
            "Entertainment",
            "Education & Learning",
            "Professional Services",
            "Sports & Recreation"
        ];

        await queryInterface.bulkDelete("categories", {
            name: categoryNames
        }, {});
    }
};