import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

const getUnReadNotification = async (req, res) => {
    try {
        const userId = req.user.userId;

        const role = req.user.role;

        const role_id = await db.Role.findOne({
            where: {
                name: role
            }
        })

        const notifications = await db.NotificationUser.findAll({
            where: {
                is_read: false,
                user_id: userId,
                role_id: role_id?.id
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