import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

const addAdmin = async (req, res) => {
    try {
        const { email, password, first_name, is_super_admin, last_name, phone_number = '', country_code = '' } = req.body;
        const currentUserId = req.user.userId;

        // Validate required fields
        if (!email || !password || !first_name || !last_name) {
            return RESPONSE.error(res, 1041, 400); // Required fields missing
        }

        // Check if current user is super admin
        const currentUser = await db.User.findByPk(currentUserId);
        if (!currentUser || !currentUser.is_super_admin) {
            return RESPONSE.error(res, 5008, 403); // Not authorized or You are not admin
        }

        // Check if user already exists
        const existingUser = await db.User.findOne({
            where: { email: email.toLowerCase() }
        });
        if (existingUser) {
            return RESPONSE.error(res, 2004, 400); // User with this email already exists
        }

        // Find the admin role
        const adminRole = await db.Role.findOne({
            where: { name: 'admin' }
        });

        if (!adminRole) {
            return RESPONSE.error(res, 5016, 400); // Role not found
        }

        // Start transaction for user creation and role assignment
        const transaction = await db.sequelize.transaction();

        try {
            // Create admin user
            const newAdmin = await db.User.create({
                email: email.toLowerCase(),

                phone_number,
                country_code,
                is_super_admin: is_super_admin
            }, { transaction });

            // Create user role entry
            await db.UserRole.create({
                user_id: newAdmin.id,
                role_id: adminRole.id,
                first_name,
                password, // Will be hashed by model hook
                last_name,
                is_verify: true
            }, { transaction });

            // Commit transaction
            await transaction.commit();

            // Fetch user with roles for response
            const adminWithRoles = await db.User.findByPk(newAdmin.id, {
                include: [{
                    model: db.Role,
                    through: { attributes: ['first_name', 'last_name', 'is_verify'] },
                    attributes: ['id', 'name']
                }]
            });

            const responseData = {
                id: adminWithRoles.id,
                email: adminWithRoles.email,
                first_name: adminWithRoles.Roles[0]?.UserRole?.first_name || '',
                last_name: adminWithRoles.Roles[0]?.UserRole?.last_name || '',
                roles: adminWithRoles.Roles.map(role => ({ id: role.id, name: role.name })),
                phone_number: adminWithRoles.phone_number,
                country_code: adminWithRoles.country_code,
                is_verify: adminWithRoles.Roles[0]?.UserRole?.is_verify || false,
                is_super_admin: adminWithRoles.is_super_admin
            };

            return RESPONSE.success(res, 1001, responseData); // User registered successfully

        } catch (transactionError) {
            // Rollback transaction on error
            await transaction.rollback();
            return RESPONSE.error(res, 2999, 500, transactionError);
        }

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { addAdmin };