import db from "../models/index.js";

const addOnboardNotification = async ({ data, transaction }) => {
    try {
        const business_map = {
            "admin": "Admin",
            "user": "User",
            "business_owner": "Business Owner"
        }

        const role_id = await db.Role.findOne({
            where: {
                name: "admin"
            }
        });

        // Get the role name from the user's roles
        const userRole = data.role

        const title = `${data.first_name} ${data.last_name} has been onboarded as ${business_map[userRole]}`;

        const notification = await db.Notification.create({
            message: title,
            send_by: data.id // user themselves or admin who registered
        }, { transaction });

        // await db.NotificationRole.create({
        //     notification_id: notification.id,
        //     role_id: role_id.id
        // }, { transaction });

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
            role_id: role_id.id,
            is_read: false
        }));

        await db.NotificationUser.bulkCreate(notificationUsers, { transaction });

        return { notification_id: notification.id }

    } catch (error) {
        console.log(error, "EEE")
        await transaction.rollback();
    }


};

export default addOnboardNotification;