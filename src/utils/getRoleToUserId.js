import db from "../models/index.js";

async function getRoleToUserId(userId, roleId) {
    return await db.UserRole.findOne({
        where: {
            user_id: userId,
            role_id: roleId
        }
    }).then((res) => {
        return res.id;
    });
}

export { getRoleToUserId }
