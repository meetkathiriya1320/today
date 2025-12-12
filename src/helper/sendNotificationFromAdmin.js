import db from "../models/index.js";

const sendNotificationFromAdmin = async ({ data, transaction }) => {
    try {


        const title = data.message;

        const notification = await db.Notification.create({
            message: title,
            send_by: data.id // user themselves or admin who registered
        }, { transaction });


        await db.NotificationUser.create({ notification_id: notification.id, user_id: data.business_id, is_read: false, redirect_url: data?.redirect_url || null }, { transaction });

        return { notification_id: notification.id }

    } catch (error) {

        await transaction.rollback();
    }
}

export default sendNotificationFromAdmin