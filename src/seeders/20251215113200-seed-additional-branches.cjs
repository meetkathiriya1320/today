'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     * Create additional branches for existing businesses
     */
    
    // Get existing businesses to add more branches to them
    const businesses = await queryInterface.sequelize.query(
      "SELECT id, business_name FROM businesses",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (businesses.length === 0) {
      throw new Error('No businesses found. Please run the business owners seeder first.');
    }

    // Create additional branches for existing businesses
    const additionalBranches = [
      // For Mario's Italian Restaurant
      {
        business_id: businesses[0].id, // Mario's Italian Restaurant
        branch_name: "Queens Branch",
        phone_number: "+1987654330",
        country_code: "+1",
        iso_code: "US",
        latitude: "40.7282",
        longitude: "-73.7949",
        contact_name: "Mario Rossi",
        location: "147 Queens Blvd, Queens, NY 11375",
        city: "Queens",
        updated_by: null,
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        business_id: businesses[0].id, // Mario's Italian Restaurant
        branch_name: "Manhattan Branch",
        phone_number: "+1987654331",
        country_code: "+1",
        iso_code: "US",
        latitude: "40.7831",
        longitude: "-73.9712",
        contact_name: "Mario Rossi",
        location: "258 Upper East Side, New York, NY 10021",
        city: "Manhattan",
        updated_by: null,
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      
      // For Anderson's Fashion Store
      {
        business_id: businesses[1].id, // Anderson's Fashion Store
        branch_name: "Beverly Hills Store",
        phone_number: "+1987654332",
        country_code: "+1",
        iso_code: "US",
        latitude: "34.0736",
        longitude: "-118.4004",
        contact_name: "Lisa Anderson",
        location: "369 Rodeo Drive, Beverly Hills, CA 90210",
        city: "Beverly Hills",
        updated_by: null,
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        business_id: businesses[1].id, // Anderson's Fashion Store
        branch_name: "San Francisco Store",
        phone_number: "+1987654333",
        country_code: "+1",
        iso_code: "US",
        latitude: "37.7749",
        longitude: "-122.4194",
        contact_name: "Lisa Anderson",
        location: "741 Union Square, San Francisco, CA 94102",
        city: "San Francisco",
        updated_by: null,
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      
      // For FitLife Gym & Wellness Center
      {
        business_id: businesses[2].id, // FitLife Gym & Wellness Center
        branch_name: "Northside Gym",
        phone_number: "+1987654334",
        country_code: "+1",
        iso_code: "US",
        latitude: "41.8781",
        longitude: "-87.6298",
        contact_name: "Chris Martinez",
        location: "852 North Michigan Ave, Chicago, IL 60611",
        city: "Chicago",
        updated_by: null,
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        business_id: businesses[2].id, // FitLife Gym & Wellness Center
        branch_name: "Southside Fitness",
        phone_number: "+1987654335",
        country_code: "+1",
        iso_code: "US",
        latitude: "41.8781",
        longitude: "-87.6298",
        contact_name: "Chris Martinez",
        location: "963 South State St, Chicago, IL 60605",
        city: "Chicago",
        updated_by: null,
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      }
    ];

    await queryInterface.bulkInsert("branches", additionalBranches, {});
    
    console.log(`✅ Created ${additionalBranches.length} additional branches for existing businesses`);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     * Remove additional branches (keeping the original ones)
     */
    
    try {
      // Delete branches that were created by this seeder
      // We'll identify them by specific phone numbers or location patterns
      const phoneNumbers = [
        '+1987654330', '+1987654331', '+1987654332', 
        '+1987654333', '+1987654334', '+1987654335'
      ];
      
      await queryInterface.bulkDelete("branches", { 
        phone_number: phoneNumbers 
      }, {});
      
      console.log('✅ Removed additional branches created by this seeder');
    } catch (error) {
      console.error('Error in down migration:', error);
      throw error;
    }
  }
};