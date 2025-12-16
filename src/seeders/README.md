# Database Seeders

This directory contains database seeders for initializing the application with default data.

## Available Seeders

### 1. Roles Seeder (`20251201124043-seed-roles.cjs`)

Creates default roles for the application:

- `admin` - Administrator role
- `user` - Regular user role
- `business_owner` - Business owner role

### 2. Admin User Seeder (`20251215071614-seed-admin-user.cjs`)

Creates a default admin user with the following credentials:

- **Email**: admin@example.com
- **Password**: admin123
- **Name**: Admin User
- **Phone**: +1234567890
- **Role**: admin
- **Super Admin**: true

### 3. Regular Users Seeder (`20251215113130-seed-regular-users.cjs`)

Creates 5 sample regular users with the following credentials:

- **Email**: john.doe@example.com, jane.smith@example.com, mike.wilson@example.com, sarah.johnson@example.com, david.brown@example.com
- **Password**: user123
- **Role**: user
- **Verified**: Yes
- **Status**: Active

### 4. Business Owners Seeder (`20251215113140-seed-business-owners.cjs`)

Creates 3 business owners with complete business setups:

- **Business Owner 1**: Mario Rossi (restaurant owner)
  - Email: restaurant.owner@example.com
  - Business: Mario's Italian Restaurant
  - Branch: Main Location (NYC) + Brooklyn Branch
- **Business Owner 2**: Lisa Anderson (retail store)
  - Email: retail.store@example.com
  - Business: Anderson's Fashion Store
  - Branch: Downtown Store (LA)
- **Business Owner 3**: Chris Martinez (fitness gym)
  - Email: fitness.gym@example.com
  - Business: FitLife Gym & Wellness Center
  - Branch: Main Gym (Chicago) + Westside Location

### 5. Additional Branches Seeder (`20251215113200-seed-additional-branches.cjs`)

Creates 6 additional branches for existing businesses:

- Queens & Manhattan branches for Mario's Italian Restaurant
- Beverly Hills & San Francisco stores for Anderson's Fashion Store
- Northside & Southside gyms for FitLife Gym & Wellness Center

### 6. Categories Seeder (`20251215113210-seed-categories.cjs`)

Creates 12 sample categories for offers:

- Food & Dining, Fashion & Clothing, Health & Fitness
- Electronics & Technology, Beauty & Personal Care, Home & Garden
- Travel & Tourism, Automotive, Entertainment, Education & Learning
- Professional Services, Sports & Recreation

### 7. Image URL Fix Seeder (`20251215090120-fix-image-urls.cjs`)

Fixes duplicate localhost URLs in image fields across all tables:

- Categories images
- Offer images
- Business images
- Home banner images
- Advertisement banner images

## How to Run Seeders

### Prerequisites

1. Ensure your database is set up and migrations have been run:

   ```bash
   npm run migrate
   ```

2. Run seeders in this specific order:

   ```bash
   # 1. Create roles (required for all other seeders)
   npx sequelize-cli db:seed --seed 20251201124043-seed-roles.cjs --config src/config/config.js

   # 2. Create admin user
   npx sequelize-cli db:seed --seed 20251215071614-seed-admin-user.cjs --config src/config/config.js

   # 3. Create regular users
   npx sequelize-cli db:seed --seed 20251215113130-seed-regular-users.cjs --config src/config/config.js

   # 4. Create business owners with businesses and branches
   npx sequelize-cli db:seed --seed 20251215113140-seed-business-owners.cjs --config src/config/config.js

   # 5. Create additional branches for existing businesses
   npx sequelize-cli db:seed --seed 20251215113200-seed-additional-branches.cjs --config src/config/config.js

   # 6. Create sample categories
   npx sequelize-cli db:seed --seed 20251215113210-seed-categories.cjs --config src/config/config.js

   # 7. Fix any existing duplicate image URLs
   npx sequelize-cli db:seed --seed 20251215090120-fix-image-urls.cjs --config src/config/config.js
   ```

### Run All Seeders

```bash
npm run seed
```

### Run Specific Seeder

```bash
npx sequelize-cli db:seed --seed 20251215113140-seed-business-owners.cjs --config src/config/config.js
```

### Undo Last Seeder

```bash
npx sequelize-cli db:seed:undo --config src/config/config.js
```

### Undo All Seeders

```bash
npx sequelize-cli db:seed:undo:all --config src/config/config.js
```

## Important Notes

1. **Order Matters**:

   - Roles seeder must run before all other seeders
   - Admin user should be created before regular users and business owners
   - Business owners seeder creates the businesses and branches
   - Categories can be run at any time after roles

2. **Password Security**: All user passwords will be automatically hashed using bcrypt before storage.

3. **Database Constraints**: All seeders handle foreign key constraints properly by creating entities in the correct order.

4. **Idempotent**:

   - Most seeders can be run multiple times safely
   - Additional branches seeder can be run to add more branches
   - Image URL fix seeder is designed to be run as needed

5. **Image URL Fix**: The image URL fix seeder specifically addresses duplicate localhost URL issues.

## Test Login Credentials

### Admin Access

- **Email**: admin@example.com
- **Password**: admin123

### Regular Users

- **Email**: john.doe@example.com (Password: user123)
- **Email**: jane.smith@example.com (Password: user123)
- **Email**: mike.wilson@example.com (Password: user123)
- **Email**: sarah.johnson@example.com (Password: user123)
- **Email**: david.brown@example.com (Password: user123)

### Business Owners

- **Email**: restaurant.owner@example.com (Password: business123)
- **Email**: retail.store@example.com (Password: business123)
- **Email**: fitness.gym@example.com (Password: business123)

**⚠️ Security Warning**: Change all default passwords immediately after first login in a production environment!

## Database Structure Created

After running all seeders, you'll have:

- **1 Admin User** (super admin)
- **5 Regular Users** (customers)
- **3 Business Owners** (with complete business setups)
- **3 Businesses** (Restaurant, Fashion Store, Gym)
- **8 Branches** (across NYC, LA, Chicago, Beverly Hills, San Francisco, Queens, Manhattan)
- **12 Categories** (for organizing offers)
- **3 Roles** (admin, user, business_owner)

## Image API Integration

The application includes a comprehensive Image API (`src/controllers/images/`) that:

- Serves images directly from `/images/:filename`
- Provides utility functions for URL generation
- Handles duplicate URL prevention
- Includes proper caching headers

See `src/controllers/images/README.md` for detailed API documentation.
