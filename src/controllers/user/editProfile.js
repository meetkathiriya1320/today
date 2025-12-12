import db from "../../models/index.js";
import { RESPONSE } from "../../helper/response.js";

const editProfile = async (req, res) => {
    try {
        const user_id = req.user.userId;
        const role_id = req.user.roleId;
        const { first_name, last_name } = req.body;

        // Update user role
        await db.UserRole.update({
            first_name,
            last_name
        }, {
            where: {
                user_id: user_id,
                role_id: role_id
            }
        });

        // Fetch updated user data with role
        const updatedUser = await db.User.findOne({
            where: {
                id: user_id
            },
            include: [{
                model: db.UserRole,
                where: { role_id: role_id },
                attributes: ['first_name', 'last_name'],
                include: [{
                    model: db.Role,
                    attributes: ['name']
                }]
            }],
            attributes: ['id', 'email']
        });

        const userData = {
            id: updatedUser.id,
            email: updatedUser.email,
            first_name: updatedUser.UserRoles?.[0]?.first_name || '',
            last_name: updatedUser.UserRoles?.[0]?.last_name || '',
            role: updatedUser.UserRoles?.[0]?.Role?.name || ''
        };

        return RESPONSE.success(res, 5036, userData);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { editProfile };