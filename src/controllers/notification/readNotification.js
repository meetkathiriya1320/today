import { Op } from "sequelize"
import db from "../../models/index.js"
import { RESPONSE } from "../../helper/response.js";

const readNotification = async (req, res) => {
    try {
        const userId = req.user.userId;
        const notificationIds = req.body.id; // array of notification ids
        const role = req.user.role;

        const role_id = await db.Role.findOne({
            where: {
                name: role
            }
        })

        await db.NotificationUser.update({ is_read: true }, {
            where: {
                notification_id: {
                    [Op.in]: notificationIds
                },
                user_id: userId,
                role_id: role_id.id
            }
        });

        return RESPONSE.success(res);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { readNotification }