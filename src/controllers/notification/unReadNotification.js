import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

const getUnReadNotification = async (req, res) => {
    try {
        const userId = req.user.userId;
        const notifications = await db.NotificationUser.findAll({
            where: {
                is_read: false,
                user_id: userId
            },
            include: [{
                model: db.Notification,
                include: [{
                    model: db.User,
                    as: 'sender',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                }]
            }],
            order: [['created_at', 'DESC']]
        });

        return RESPONSE.success(res, 1066, notifications);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getUnReadNotification };