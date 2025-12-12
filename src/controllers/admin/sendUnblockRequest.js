import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import sendRequestNotification from '../../helper/sendRequestNotification.js';
import { getCurrentNotification } from '../notification/createNotification.js';

const sendUnblockRequest = async (req, res) => {
    const transaction = await db.sequelize.transaction()
    try {

        const { note, user_id } = req.body;

        // Check if there's already a pending unblock request for this user
        const existingRequest = await db.UnblockUserRequest.findOne({
            where: {
                user_id,
                status: 'pending'
            }
        });

        if (existingRequest) {
            return RESPONSE.error(res, 5076, 400); // Unblock request already exists and is pending
        }

        const request = await db.UnblockUserRequest.create({
            user_id,
            note,
            status: 'pending'
        }, {
            transaction,
            raw: true
        });

        const role_id = await db.Role.findOne({
            where: {
                name: "business_owner"
            }
        });

        const role_to_user = await db.UserRole.findOne({
            where: {
                role_id: role_id.id,
                user_id
            }
        })

        const notify_data = {
            id: user_id,
            message: `${role_to_user.first_name} ${role_to_user.last_name} send unblock request`,
            redirect_url: "/admin/requests"
        }
        const { notification_id } = await sendRequestNotification({
            data: notify_data,
            transaction
        });

        await transaction.commit()

        const notifications = await getCurrentNotification(notification_id, ["admin"]);

        return RESPONSE.success(res, 5009, { request, notifications });
    } catch (error) {
        await transaction.rollback()
        console.error('Error sending unblock request:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { sendUnblockRequest }