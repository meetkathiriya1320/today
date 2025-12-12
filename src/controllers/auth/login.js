import bcrypt from 'bcrypt';
import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import { generateToken } from '../../helper/jwt.js';
import { getRoleToUserId } from '../../utils/getRoleToUserId.js';

const login = async (req, res) => {
    try {
        const { email, password, role_id } = req.body;

        // const role_id = await db.Role.findOne({
        //     where: {
        //         name: role
        //     }
        // }).then((res) => {
        //     return res.id
        // })

        // Validate input
        if (!email || !password) {
            return RESPONSE.error(res, 2001, 400);
        }

        // Find user by email
        const user = await db.User.findOne({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return RESPONSE.error(res, 2026, 401);
        }


        // Block check will be done per role below

        // Fetch user with roles
        const userWithRoles = await db.User.findByPk(user.id, {
            include: [{
                model: db.Role,
                through: { attributes: ['is_verify', 'first_name', 'last_name'] },
                attributes: ['id', 'name']
            }]
        });



        // Determine role
        let selectedRole;
        if (role_id) {
            // Find and validate provided role
            const roleRecord = await db.Role.findOne({
                where: { id: role_id }
            });

            if (!roleRecord) {
                return RESPONSE.error(res, 2018, 400); // Invalid role
            }

            // Check if user has this role
            const userRole = await db.UserRole.findOne({
                where: {
                    user_id: user.id,
                    role_id: roleRecord.id
                }
            });



            if (!userRole) {
                return RESPONSE.error(res, 5055, 403); // User does not have the specified role
            }

            selectedRole = roleRecord;
        } else {
            // No role provided
            if (userWithRoles.Roles.length === 0) {
                return RESPONSE.error(res, 5056, 403); // User has no roles assigned
            } else if (userWithRoles.Roles.length === 1) {
                selectedRole = userWithRoles.Roles[0];
            }
            else {
                // Multiple roles, return list
                return RESPONSE.success(res, 5075, {
                    roles: userWithRoles.Roles.map(r => ({ id: r.id, name: r.name }))
                });
            }
        }

        // Get user role entry
        const userRole = await db.UserRole.findOne({
            where: {
                user_id: user.id,
                role_id: selectedRole.id
            }
        });
        if (!userRole) {
            return RESPONSE.error(res, 5055, 403); // User does not have the specified role
        }

        // Check if user role is verified (skip for roles that don't require verification)
        if (!userRole.is_verify) {
            return RESPONSE.error(res, 2011, 403); // Please verify your email first
        }

        // Check if user role is blocked
        if (userRole.is_blocked) {
            const blocked_user = await db.UserBlockHistory.findOne({
                where: {
                    status: 'blocked',
                    user_id: user.id
                },
                raw: true
            })
            return RESPONSE.success(res, 2003, { blocked_user });
        }


        // Verify password
        const isPasswordValid = await bcrypt.compare(password, userRole.password);
        if (!isPasswordValid) {
            return RESPONSE.error(res, 2027, 401);
        };

        // Get the UserRole for the selected role
        const selectedUserRole = userWithRoles.Roles.find(r => r.id === selectedRole.id)?.UserRole;

        const user_item = {
            id: userWithRoles.id,
            email: userWithRoles.email,
            first_name: selectedUserRole?.first_name || userWithRoles.first_name,
            last_name: selectedUserRole?.last_name || userWithRoles.last_name,
            role: selectedRole.name,
            roles: userWithRoles.Roles.map(role => ({ id: role.id, name: role.name })),
            phone_number: userWithRoles.phone_number,
            country_code: userWithRoles.country_code,
            is_verify: userRole.is_verify
        }

        // Generate JWT token
        const token = generateToken({
            userId: userWithRoles.id,
            email: userWithRoles.email,
            role: selectedRole.name, // Current login role
            roleId: selectedRole.id, // Current login role id
            roles: userWithRoles.Roles.map(r => r.name) // All user roles
        });

        const is_business_add = await db.Business.findOne({
            where: {
                user_id: user.id
            }
        })

        const is_admin = selectedRole.name === "admin";
        const is_user = selectedRole.name === "user";

        // Skip business check for users with "user" role
        if (!is_business_add && !is_admin && !is_user) {
            return RESPONSE.success(res, 5005, { is_business_added: false, user: user_item })
        }

        // Start transaction for login and session creation
        const transaction = await db.sequelize.transaction();

        try {

            const role_to_user_id = await getRoleToUserId(user.id, selectedRole.id)

            // Create user session
            await db.UserSession.create({
                user_role_id: role_to_user_id,
                token: token,
                expire_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            }, { transaction });

            // Commit transaction
            await transaction.commit();

            // Create new business
            const business = await db.Business.findOne({
                where: {
                    user_id: user.id
                },
                include: [
                    {
                        model: db.Branches,
                        as: "branches"
                    },
                    {
                        model: db.BusinessImage,
                        as: "business_images"
                    }
                ]
            });


            // Return success response
            const userData = {
                user: {
                    id: user.id,
                    email: userWithRoles.email,
                    first_name: selectedUserRole?.first_name || userWithRoles.first_name,
                    last_name: selectedUserRole?.last_name || userWithRoles.last_name,
                    role: selectedRole.name,
                    roles: userWithRoles.Roles.map(role => ({ id: role.id, name: role.name })),
                    phone_number: userWithRoles.phone_number,
                    country_code: userWithRoles.country_code,
                    is_verify: userRole.is_verify,
                    is_super_admin: userWithRoles.is_super_admin
                },
                token: token,
                business
            };
            return RESPONSE.success(res, 1002, userData);

        } catch (transactionError) {
            // Rollback transaction on error
            await transaction.rollback();
            return RESPONSE.error(res, 2999, 500, transactionError);
        }

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { login };

