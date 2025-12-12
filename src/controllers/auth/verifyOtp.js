import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import addOnboardNotification from '../../helper/addOnboardNotification.js';
import { getCurrentNotification } from '../notification/createNotification.js';

const verifyOtp = async (req, res) => {
    try {


        const { email, otp, role } = req.body;

        // Validate input
        if (!email || !otp) {
            return RESPONSE.error(res, 2001, 400); // Email and password are required (reusing message)
        }

        // Find user by email
        const user = await db.User.findOne({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return RESPONSE.error(res, 2014, 404); // Email not found
        }

        const role_id = await db.Role.findOne({
            where: {
                name: role
            }
        }).then((res) => {
            return res.id
        })

        // Find user role with matching OTP
        const userRole = await db.UserRole.findOne({
            where: {
                user_id: user.id,
                role_id,
                otp: otp
            },
            include: [{
                model: db.Role,
                attributes: ['name']
            }]
        });

        if (!userRole) {
            return RESPONSE.error(res, 2012, 400); // Invalid OTP
        }

        // Check if OTP is expired
        if (new Date() > userRole.otp_expiry) {
            return RESPONSE.error(res, 2013, 400); // OTP expired
        }

        // Check if already verified
        if (userRole.is_verify) {
            return RESPONSE.success(res, 1005, { message: 'Email already verified' });
        }

        // Start transaction for OTP verification
        const transaction = await db.sequelize.transaction();

        try {
            // Update user role as verified and clear OTP
            await db.UserRole.update(
                {
                    is_verify: true,
                    otp: null // Clear OTP after verification
                },
                {
                    where: { id: userRole.id },
                    transaction
                }
            );

            let notifications = [];

            if (userRole.Role.name === "business_owner") {
                const data_for_notification = {
                    id: user.id,
                    first_name: userRole.first_name,
                    last_name: userRole.last_name,
                    role: userRole.Role.name,

                }
                const { notification_id } = await addOnboardNotification({ data: { ...data_for_notification, Roles: [userRole.Role] }, transaction });

                notifications = await getCurrentNotification(notification_id, ["admin"]);
            }

            // Commit transaction
            await transaction.commit();

            // Fetch user with roles
            const userWithRoles = await db.User.findByPk(user.id, {
                include: [{
                    model: db.Role,
                    through: { attributes: ['is_verify', 'first_name', 'last_name'], where: { is_verify: true, is_blocked: false } },
                    attributes: ['id', 'name']
                }]
            });

            const userData = {
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: userRole.first_name,
                    last_name: userRole.last_name,
                    role: userRole.Role.name,
                    roles: userWithRoles.Roles.map(role => ({ id: role.id, name: role.name })),
                    phone_number: user.phone_number,
                    country_code: user.country_code,
                    is_verify: true
                }
            };


            return RESPONSE.success(res, 1005, { ...userData, notifications });

        } catch (transactionError) {
            // Rollback transaction on error
            await transaction.rollback();
            console.error('Transaction error:', transactionError);
            return RESPONSE.error(res, 2999, 500, transactionError);
        }

    } catch (error) {
        console.error('OTP verification error:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { verifyOtp };