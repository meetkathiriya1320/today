#!/usr/bin/env node

/**
 * Test script to verify seeders work correctly
 * This script helps verify that all seeded data is properly created
 */

import db from './src/models/index.js';

console.log('🧪 Testing Database Seeders\n');

async function testSeeders() {
    try {
        console.log('=== Testing Database Connection ===');
        await db.sequelize.authenticate();
        console.log('✅ Database connection successful\n');

        // Test roles
        console.log('=== Testing Roles ===');
        const roles = await db.Role.findAll();
        console.log(`✅ Found ${roles.length} roles:`);
        roles.forEach(role => {
            console.log(`   - ${role.name} (ID: ${role.id})`);
        });
        console.log('');

        // Test users
        console.log('=== Testing Users ===');
        const users = await db.User.findAll({
            include: [{
                model: db.UserRole,
                include: [db.Role]
            }]
        });
        console.log(`✅ Found ${users.length} users:`);
        users.forEach(user => {
            const userRole = user.UserRoles?.[0];
            if (userRole) {
                console.log(`   - ${user.email} (${userRole.Role?.name}) - Super Admin: ${user.is_super_admin}`);
            }
        });
        console.log('');

        // Test businesses
        console.log('=== Testing Businesses ===');
        const businesses = await db.Business.findAll({
            include: [{
                model: db.Branches
            }]
        });
        console.log(`✅ Found ${businesses.length} businesses:`);
        businesses.forEach(business => {
            console.log(`   - ${business.business_name} (${business.Branches?.length || 0} branches)`);
        });
        console.log('');

        // Test branches
        console.log('=== Testing Branches ===');
        const branches = await db.Branches.findAll({
            include: [{
                model: db.Business
            }]
        });
        console.log(`✅ Found ${branches.length} branches:`);
        branches.forEach(branch => {
            console.log(`   - ${branch.branch_name} (${branch.Business?.business_name}) - ${branch.city}`);
        });
        console.log('');

        // Test categories
        console.log('=== Testing Categories ===');
        const categories = await db.Category.findAll();
        console.log(`✅ Found ${categories.length} categories:`);
        categories.forEach(category => {
            console.log(`   - ${category.name}`);
        });
        console.log('');

        // Summary
        console.log('=== Summary ===');
        console.log(`📊 Total Users: ${users.length}`);
        console.log(`🏢 Total Businesses: ${businesses.length}`);
        console.log(`🏪 Total Branches: ${branches.length}`);
        console.log(`📂 Total Categories: ${categories.length}`);
        console.log(`👥 Total Roles: ${roles.length}`);
        console.log('');

        // Test some specific seeded data
        console.log('=== Testing Specific Seeded Data ===');

        // Check admin user
        const adminUser = await db.User.findOne({
            where: { email: 'admin@example.com' },
            include: [{
                model: db.UserRole,
                include: [db.Role]
            }]
        });
        if (adminUser) {
            console.log('✅ Admin user found and verified');
        } else {
            console.log('❌ Admin user not found');
        }

        // Check business owner
        const businessOwner = await db.User.findOne({
            where: { email: 'restaurant.owner@example.com' },
            include: [{
                model: db.UserRole,
                include: [db.Role]
            }, {
                model: db.Business
            }]
        });
        if (businessOwner) {
            console.log('✅ Business owner found and verified');
        } else {
            console.log('❌ Business owner not found');
        }

        // Check regular user
        const regularUser = await db.User.findOne({
            where: { email: 'john.doe@example.com' },
            include: [{
                model: db.UserRole,
                include: [db.Role]
            }]
        });
        if (regularUser) {
            console.log('✅ Regular user found and verified');
        } else {
            console.log('❌ Regular user not found');
        }

        console.log('\n🎉 Seeder testing completed successfully!');

    } catch (error) {
        console.error('❌ Error testing seeders:', error);
    } finally {
        await db.sequelize.close();
    }
}

// Run the test
testSeeders();