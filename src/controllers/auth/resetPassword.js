import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import { verifyToken } from '../../helper/jwt.js';

const resetPassword = async (req, res) => {
    try {
        const { password, token } = req.body;

        // Validate input
        if (!token || !password) {
            return RESPONSE.error(res, 1041, 400); // Required fields missing
        }

        // Validate password length
        if (password.length < 8) {
            return RESPONSE.error(res, 2017, 400); // Password must be at least 8 characters long
        }

        // Verify JWT token
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (err) {
            return RESPONSE.error(res, 2012, 400); // Invalid token
        }

        // Check if it's a password reset token
        if (decoded.type !== 'password_reset') {
            return RESPONSE.error(res, 2012, 400); // Invalid token
        }

        const { userId, roleId } = decoded;

        // find user role 
        const role = await db.Role.findOne({
            where: {
                id: roleId
            }
        })

        // Find the user role
        const userRole = await db.UserRole.findOne({
            where: {
                user_id: userId,
                role_id: roleId
            }
        });

        if (!userRole) {
            return RESPONSE.error(res, 5055, 403); // User does not have the specified role
        }

        // Update password
        await userRole.update({
            password: password // Will be hashed by model hook
        });

        // Destroy all sessions for this user
        await db.UserSession.destroy({
            where: {
                user_role_id: userRole.id
            }
        });

        return RESPONSE.success(res, 1006, { role: role, message: 'Password reset successfully' });

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { resetPassword };