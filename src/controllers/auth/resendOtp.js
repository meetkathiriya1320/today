import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import { generateOTP, sendOTPEmail } from '../../helper/emailService.js';

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate required fields
        if (!email) {
            return RESPONSE.error(res, 2001, 400); // Email is required
        }

        // Check if user exists
        const user = await db.User.findOne({
            where: { email: email.toLowerCase() },
            include: [{
                model: db.UserRole,
                attributes: ['first_name', 'last_name', 'is_verify', 'otp', 'otp_expiry'],
                include: [{
                    model: db.Role,
                    attributes: ['name']
                }]
            }]
        });

        if (!user) {
            return RESPONSE.error(res, 2014, 404); // Email not found
        }

        // Check if user is already verified (any role)
        const isVerified = user.UserRoles.some(role => role.is_verify);
        if (isVerified) {
            return RESPONSE.success(res, 1005, { message: 'Email already verified' });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 1 * 60 * 1000); // 1 minute

        // Start database transaction
        const transaction = await db.sequelize.transaction();

        try {
            // Update user roles with new OTP and expiry (for unverified roles)
            await db.UserRole.update({
                otp: otp,
                otp_expiry: otpExpiry
            }, {
                where: {
                    user_id: user.id,
                    is_verify: false
                },
                transaction
            });

            // Send OTP email
            const emailResult = await sendOTPEmail(email.toLowerCase(), otp);

            if (!emailResult.success) {
                // If email fails, rollback transaction
                await transaction.rollback();
                return RESPONSE.error(res, 2999, 500);
            }

            // Commit transaction if everything succeeds
            await transaction.commit();

            // Return success response
            const userData = {
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.UserRoles[0]?.first_name || '',
                    last_name: user.UserRoles[0]?.last_name || '',
                    role: user.UserRoles[0]?.Role?.name || '',
                    phone_number: user.phone_number,
                    country_code: user.country_code,
                    is_verify: false
                },
                message: 'OTP resent to your email successfully'
            };

            return RESPONSE.success(res, 1004, userData);

        } catch (transactionError) {
            // Rollback transaction on any error
            await transaction.rollback();
            console.error('Transaction error:', transactionError);
            return RESPONSE.error(res, 2999, 500, transactionError);
        }

    } catch (error) {
        console.error('Resend OTP error:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { resendOtp };