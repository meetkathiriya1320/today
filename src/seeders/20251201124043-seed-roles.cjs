'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
    
    */
    return queryInterface.bulkInsert(
      "roles",
      [
        {
          name: "admin",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "user",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "business_owner",
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
     *
     */
    return queryInterface.bulkDelete("roles", null, {});
  }
};
