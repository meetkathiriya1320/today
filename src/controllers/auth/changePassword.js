import bcrypt from 'bcrypt';
import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

const changePassword = async (req, res) => {
    try {
        const { old_password, new_password, confirm_password } = req.body;
        const userId = req.user.userId; // From auth middleware

        // Validate input
        if (!old_password || !new_password || !confirm_password) {
            return RESPONSE.error(res, 2021, 400); // Required fields
        }

        // Check if new password matches confirm password
        if (new_password !== confirm_password) {
            return RESPONSE.error(res, 2016, 400); // Passwords do not match
        }

        // Validate password length
        if (new_password.length < 8) {
            return RESPONSE.error(res, 2017, 400); // Password must be at least 8 characters
        }

        // Find user role for current role
        const userRole = await db.UserRole.findOne({
            where: {
                user_id: userId,
                role_id: req.user.roleId // Assuming JWT has roleId
            }
        });
        if (!userRole) {
            return RESPONSE.error(res, 2014, 404);
        }

        // Verify old password
        const isOldPasswordValid = await bcrypt.compare(old_password, userRole.password);
        if (!isOldPasswordValid) {
            return RESPONSE.error(res, 2022, 400); // Invalid password
        }

        // Update password (hook will hash it)
        await db.UserRole.update(
            { password: new_password },
            { where: { id: userRole.id }, individualHooks: true }
        );

        await db.UserSession.destroy({
            where: {
                user_role_id: userRole.id
            }
        });

        // Return success
        return RESPONSE.success(res, 1006);

    } catch (error) {
        console.error('Change password error:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { changePassword };