import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

const editAdmin = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { user_id, first_name, last_name, password } = req.body;
        const currentUserId = req.user.userId;

        // Validate required fields
        if (!user_id) {
            await transaction.rollback();
            return RESPONSE.error(res, 1041, 400); // Required fields missing
        }

        // Check if current user is super admin
        const currentUser = await db.User.findByPk(currentUserId, { transaction });
        if (!currentUser || !currentUser.is_super_admin) {
            await transaction.rollback();
            return RESPONSE.error(res, 5008, 403); // Not authorized
        }

        // Find the admin role
        const adminRole = await db.Role.findOne({
            where: { name: 'admin' },
            transaction
        });

        if (!adminRole) {
            await transaction.rollback();
            return RESPONSE.error(res, 5016, 400); // Role not found
        }

        // Find the UserRole record
        const userRole = await db.UserRole.findOne({
            where: {
                user_id: user_id,
                role_id: adminRole.id
            },
            transaction
        });

        if (!userRole) {
            await transaction.rollback();
            return RESPONSE.error(res, 5057, 404); // User role not found
        }

        // Prepare update data
        const updateData = {};
        if (first_name !== undefined) updateData.first_name = first_name;
        if (last_name !== undefined) updateData.last_name = last_name;
        if (password !== undefined) updateData.password = password; // Will be hashed by hook

        // Update the UserRole
        await userRole.update(updateData, { transaction });

        await transaction.commit();

        // Fetch updated user with roles for response
        const updatedUser = await db.User.findByPk(user_id, {
            include: [{
                model: db.Role,
                through: { attributes: ['first_name', 'last_name', 'is_verify'] },
                attributes: ['id', 'name']
            }]
        });

        const responseData = {
            id: updatedUser.id,
            email: updatedUser.email,
            first_name: updatedUser.Roles[0]?.UserRole?.first_name || '',
            last_name: updatedUser.Roles[0]?.UserRole?.last_name || '',
            roles: updatedUser.Roles.map(role => ({ id: role.id, name: role.name })),
            phone_number: updatedUser.phone_number,
            country_code: updatedUser.country_code,
            is_verify: updatedUser.Roles[0]?.UserRole?.is_verify || false,
            is_super_admin: updatedUser.is_super_admin
        };

        return RESPONSE.success(res, 1008, responseData); // Assuming 1008 is update success

    } catch (error) {
        await transaction.rollback();
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { editAdmin };