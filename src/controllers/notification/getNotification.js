import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import { Sequelize } from 'sequelize';

const getNotification = async (req, res) => {
    try {
        const userId = req.user.userId;

        const role = req.user.role;
        const { is_read } = req.query;

        const where_condition = {
            user_id: userId
        };

        if (is_read !== undefined) {
            where_condition.is_read = is_read === 'true';
        }

        const notifications = await db.NotificationUser.findAll({
            where: where_condition,
            include: [
                {
                    model: db.Notification,
                    include: [
                        {
                            model: db.User,
                            as: 'sender',
                            attributes: ['id', 'email'],
                            include: [
                                {
                                    model: db.Role,
                                    where: { name: role },
                                    attributes: ["id", "name"],
                                    through: { attributes: ['first_name', 'last_name'] },
                                    required: false
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return RESPONSE.success(res, 1066, notifications);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getNotification };