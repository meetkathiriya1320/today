import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import { Op } from 'sequelize';

const createNotification = async (req, res) => {
    try {
        const { roles, message } = req.body;
        const user_id = req.user.userId;
        const image = req.file ? '/images/' + req.file.filename : null;

        const transaction = await db.sequelize.transaction();

        try {
            // Create notification
            const notification = await db.Notification.create({
                message,
                image: image,
                send_by: user_id
            }, { transaction });

            // Find roles
            const roleRecords = await db.Role.findAll({
                where: {
                    name: {
                        [Op.in]: roles
                    }
                },
                transaction
            });

            // Create notification roles
            const notificationRoles = roleRecords.map(role => ({
                notification_id: notification.id,
                role_id: role.id
            }));
            await db.NotificationRole.bulkCreate(notificationRoles, { transaction });

            // Find users with these roles
            const users = await db.User.findAll({
                include: [{
                    model: db.Role,
                    where: {
                        name: {
                            [Op.in]: roles
                        }
                    },
                    through: { attributes: [] },
                    attributes: []
                }],
                transaction
            });

            // Create notification users
            const notificationUsers = users.map(user => ({
                notification_id: notification.id,
                user_id: user.id,
                is_read: false
            }));
            await db.NotificationUser.bulkCreate(notificationUsers, { transaction });

            await transaction.commit();



            const notifications = await getCurrentNotification(notification.id, roles);


            return RESPONSE.success(res, 5042, notifications, 201);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { createNotification }

export async function getCurrentNotification(notification_id, roles) {
    const data = await db.NotificationUser.findAll({
        where: {
            notification_id: notification_id,
        },
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
                                where: {
                                    name: {
                                        [Op.in]: roles
                                    }
                                },
                                attributes: ["name", "id"],
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

    return { data, role: roles }
}
