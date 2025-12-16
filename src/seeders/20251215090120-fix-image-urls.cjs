'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Fix duplicate localhost URLs in image fields
         */

        try {
            // Fix categories table
            await queryInterface.sequelize.query(`
        UPDATE categories 
        SET image = REPLACE(image, 'http://localhost:3000http://localhost:3000', 'http://localhost:3000')
        WHERE image LIKE 'http://localhost:3000http://localhost:3000%'
      `);

            // Fix offer_images table
            await queryInterface.sequelize.query(`
        UPDATE offer_images 
        SET image = REPLACE(image, 'http://localhost:3000http://localhost:3000', 'http://localhost:3000')
        WHERE image LIKE 'http://localhost:3000http://localhost:3000%'
      `);

            // Fix business_images table
            await queryInterface.sequelize.query(`
        UPDATE business_images 
        SET image_url = REPLACE(image_url, 'http://localhost:3000http://localhost:3000', 'http://localhost:3000')
        WHERE image_url LIKE 'http://localhost:3000http://localhost:3000%'
      `);

            // Fix home_banners table
            await queryInterface.sequelize.query(`
        UPDATE home_banners 
        SET banner_image = REPLACE(banner_image, 'http://localhost:3000http://localhost:3000', 'http://localhost:3000')
        WHERE banner_image LIKE 'http://localhost:3000http://localhost:3000%'
      `);

            // Fix advertise_banners table
            await queryInterface.sequelize.query(`
        UPDATE advertise_banners 
        SET banner_image = REPLACE(banner_image, 'http://localhost:3000http://localhost:3000', 'http://localhost:3000')
        WHERE banner_image LIKE 'http://localhost:3000http://localhost:3000%'
      `);

            console.log('✅ Fixed duplicate localhost URLs in image fields');

        } catch (error) {
            console.error('❌ Error fixing image URLs:', error);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        /**
         * Revert the image URL fixes
         * Note: This is a safety measure, but we cannot reliably reverse the changes
         */
        console.log('ℹ️  No rollback available for image URL fixes');
    }
};