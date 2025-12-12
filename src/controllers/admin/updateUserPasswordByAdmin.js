import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

const updateUserPasswordByAdmin = async (req, res) => {
    try {
        const { user_id, new_password, confirm_password } = req.body;

        // Validate input
        if (!user_id || !new_password || !confirm_password) {
            return RESPONSE.error(res, 1041, 400); // Required fields missing
        }

        // Check if new password matches confirm password
        if (new_password !== confirm_password) {
            return RESPONSE.error(res, 2016, 400); // Passwords do not match
        }

        // Validate password length
        if (new_password.length < 8) {
            return RESPONSE.error(res, 2017, 400); // Password must be at least 8 characters
        }

        // Find the business_owner role
        const businessOwnerRole = await db.Role.findOne({
            where: { name: 'business_owner' }
        });

        if (!businessOwnerRole) {
            return RESPONSE.error(res, 5016, 400); // Role not found
        }

        // Find the UserRole for this user and business_owner role
        const userRole = await db.UserRole.findOne({
            where: {
                user_id: user_id,
                role_id: businessOwnerRole.id
            }
        });

        if (!userRole) {
            return RESPONSE.error(res, 5055, 403); // User does not have the business_owner role
        }

        // Update password in UserRole (model hook will hash it)
        await userRole.update({
            password: new_password
        });

        // Destroy all sessions for this user
        await db.UserSession.destroy({
            where: {
                user_role_id: userRole.id
            }
        });

        // Return success
        return RESPONSE.success(res, 1006); // Password changed successfully

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { updateUserPasswordByAdmin };