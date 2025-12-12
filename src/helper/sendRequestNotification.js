import db from "../models/index.js";

const sendRequestNotification = async ({ data, transaction }) => {
    try {
        const role_id = await db.Role.findOne({
            where: {
                name: "admin"
            }
        });

        const business = data.business_name
        const type = data.type

        const title = data?.message ?? `${business} sent a ${type} request.`;

        const notification = await db.Notification.create({
            message: title,
            send_by: data.id // user themselves or admin who registered
        }, { transaction });

        await db.NotificationRole.create({
            notification_id: notification.id,
            role_id: role_id.id
        }, { transaction });

        const findAdmins = await db.User.findAll({
            include: [
                {
                    model: db.Role,
                    where: {
                        name: "admin"
                    },
                    attributes: [],
                    through: {
                        attributes: []
                    }
                }
            ],
            attributes: ['id']
        });

        const adminIds = findAdmins.map(admin => admin.id);

        const notificationUsers = adminIds.map(adminId => ({
            notification_id: notification.id,
            user_id: adminId,
            is_read: false,
            redirect_url: data?.redirect_url || null
        }));

        await db.NotificationUser.bulkCreate(notificationUsers, { transaction });

        return { notification_id: notification.id }

    } catch (error) {
        await transaction.rollback();
    }


};

export default sendRequestNotification;