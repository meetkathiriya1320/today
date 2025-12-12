import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import { sendPasswordResetEmail } from '../../helper/emailService.js';
import { generateToken } from '../../helper/jwt.js';

const forgotPassword = async (req, res) => {
    try {
        const { email, role } = req.body;

        // Validate input
        if (!email || !role) {
            return RESPONSE.error(res, 1041, 400); // Required fields missing
        }

        // Find user by email
        const user = await db.User.findOne({
            where: { email: email.toLowerCase() },
            include: [{
                model: db.UserRole,
                include: [{
                    model: db.Role,
                    where: { name: role }
                }]
            }]
        });

        if (!user) {
            return RESPONSE.error(res, 2014, 404); // Email not found
        }

        // Check if user has the specified role
        const userRole = user.UserRoles.find(ur => ur.Role.name === role);
        if (!userRole) {
            return RESPONSE.error(res, 5055, 403); // User does not have the specified role
        }

        // Generate JWT reset token
        const token = generateToken({
            userId: user.id,
            roleId: userRole.role_id,
            type: 'password_reset'
        }, '10m'); // 10 minutes expiry

        // Send password reset email with token
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        const emailResult = await sendPasswordResetEmail(user.email, resetLink);
        if (!emailResult.success) {
            return RESPONSE.error(res, 2999, 500, 'Failed to send email');
        }

        return RESPONSE.success(res, 5060, {});

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { forgotPassword };