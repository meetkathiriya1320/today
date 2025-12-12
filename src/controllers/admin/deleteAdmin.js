import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

const deleteAdmin = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { user_id, role_name } = req.query;
        const currentUserId = req.user.userId;

        // Validate required fields
        if (!user_id || !role_name) {
            await transaction.rollback();
            return RESPONSE.error(res, 1041, 400); // Required fields missing
        }

        // Check if current user is super admin
        const currentUser = await db.User.findByPk(currentUserId, { transaction });
        if (!currentUser || !currentUser.is_super_admin) {
            await transaction.rollback();
            return RESPONSE.error(res, 5008, 403); // Not authorized
        }

        // Find the role by name
        const role = await db.Role.findOne({
            where: { name: role_name },
            transaction
        });

        if (!role) {
            await transaction.rollback();
            return RESPONSE.error(res, 5016, 400); // Role not found
        }

        // Find the UserRole record
        const userRole = await db.UserRole.findOne({
            where: {
                user_id: user_id,
                role_id: role.id
            },
            transaction
        });

        if (!userRole) {
            await transaction.rollback();
            return RESPONSE.error(res, 5057, 404); // User role not found
        }

        // Soft delete the UserRole
        await userRole.destroy({ transaction });

        // Check if user has any other roles
        const otherRoles = await db.UserRole.findAll({
            where: { user_id: user_id },
            transaction
        });

        if (otherRoles.length === 0) {
            // No other roles, soft delete the user
            const user = await db.User.findByPk(user_id, { transaction });
            if (user) {
                await user.destroy({ transaction });
            }
        }

        await transaction.commit();

        return RESPONSE.success(res, 5058, null);

    } catch (error) {
        await transaction.rollback();
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { deleteAdmin };