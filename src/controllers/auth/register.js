import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import { generateOTP, sendOTPEmail } from '../../helper/emailService.js';

const register = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { email, password, first_name, last_name, role, phone_number, country_code } = req.body;

        // Validate required fields
        if (!email || !password || !role) {
            return RESPONSE.error(res, 2005, 400);
        }

        // Validate password length
        if (password.length < 8) {
            return RESPONSE.error(res, 2017, 400); // Password must be at least 8 characters
        }

        // Find role from roles table
        const roleRecord = await db.Role.findOne({
            where: { name: role }
        });

        if (!roleRecord) {
            return RESPONSE.error(res, 2018, 400); // Invalid role
        }

        // Check if user already exists
        let user = await db.User.findOne({
            where: { email: email.toLowerCase() },
            include: [{
                model: db.Role,
                through: { attributes: ['is_verify'] },
                attributes: ['id', 'name']
            }],
            transaction
        });

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 1 * 60 * 1000); // 1 minute

        if (user) {
            // User exists, check if they have the requested role
            const existingUserRole = user.Roles.find(r => r.id === roleRecord.id);

            if (existingUserRole) {
                // User has the role
                if (existingUserRole.UserRole.is_verify) {
                    // Already verified with this role
                    await transaction.rollback();
                    return RESPONSE.error(res, 2004, 409);
                } else {
                    // Not verified, update OTP and resend
                    await db.UserRole.update({
                        otp: otp,
                        otp_expiry: otpExpiry,
                        ...(password && { password: password }),
                        ...(first_name && { first_name }),
                        ...(last_name && { last_name })
                    }, {
                        where: {
                            user_id: user.id,
                            role_id: roleRecord.id
                        },
                        individualHooks: true,
                        transaction
                    });

                    // Update user details if provided
                    if (first_name || last_name || phone_number || country_code) {
                        await db.User.update({
                            ...(first_name && { first_name }),
                            ...(last_name && { last_name }),
                            ...(phone_number && { phone_number }),
                            ...(country_code && { country_code }),
                        }, {
                            where: { id: user.id },
                            transaction
                        });
                    }
                }
            } else {
                // User exists but doesn't have this role, create new role
                await db.UserRole.create({
                    user_id: user.id,
                    role_id: roleRecord.id,
                    first_name: first_name,
                    last_name: last_name,
                    otp: otp,
                    otp_expiry: otpExpiry,
                    is_verify: false,
                    is_blocked: false,
                    password: password
                }, { transaction });
            }
        } else {
            // Create new user
            user = await db.User.create({
                email: email.toLowerCase(),
                phone_number: phone_number || null,
                country_code: country_code || null,
                otp: otp,
            }, { transaction });

            // Create UserRole
            await db.UserRole.create({
                user_id: user.id,
                role_id: roleRecord.id,
                first_name: first_name,
                last_name: last_name,
                otp: otp,
                otp_expiry: otpExpiry,
                is_verify: false,
                is_blocked: false,
                password: password
            }, { transaction });
        }

        // Send OTP email
        const emailResult = await sendOTPEmail(email.toLowerCase(), otp);

        if (!emailResult.success) {
            // If email fails, rollback transaction
            await transaction.rollback();
            return RESPONSE.error(res, 2999, 500);
        }

        // Commit transaction
        await transaction.commit();

        // Fetch updated user data for response
        const updatedUser = await db.User.findByPk(user.id, {
            include: [{
                model: db.Role,
                through: { attributes: ['first_name', 'last_name'] },
                attributes: ['id', 'name']
            }]
        });

        const registeredUserRole = updatedUser.Roles.find(r => r.id === roleRecord.id)?.UserRole;

        const userData = {
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                first_name: registeredUserRole?.first_name || updatedUser.first_name,
                last_name: registeredUserRole?.last_name || updatedUser.last_name,
                role: roleRecord.name,
                roles: updatedUser.Roles.map(role => ({ id: role.id, name: role.name })),
                phone_number: updatedUser.phone_number,
                country_code: updatedUser.country_code,
                is_verify: false
            },
            message: 'Please check your email for verification code'
        };

        return RESPONSE.success(res, 1004, userData, user ? 200 : 201);

    } catch (error) {
        console.error('Registration error:', error);
        if (transaction) await transaction.rollback();
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { register };