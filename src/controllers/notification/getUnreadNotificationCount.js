import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

const getUnReadNotificationCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const count = await db.NotificationUser.count({
            where: {
                is_read: false,
                user_id: userId
            }
        });

        return RESPONSE.success(res, 1066, count);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getUnReadNotificationCount };