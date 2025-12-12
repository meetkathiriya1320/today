import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import sendNotificationFromAdmin from '../../helper/sendNotificationFromAdmin.js';
import { getCurrentNotification } from '../notification/createNotification.js';

// Block/Unblock Offer
const blockOffer = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { offer_id } = req.params; // Get offer_id from URL parameters
        const { blocked, block_reason } = req.body; // blocked: true/false, optional reason for blocking

        if (!offer_id) {
            return RESPONSE.error(res, 1074, 400); // Missing offer_id parameter
        }

        if (typeof blocked !== 'boolean') {
            return RESPONSE.error(res, 1076, 400); // Missing or invalid blocked parameter
        }

        const offer = await db.Offer.findByPk(offer_id, {
            include: [{
                model: db.User,
                attributes: ['id', 'email']
            }]
        });

        if (!offer) {
            return RESPONSE.error(res, 1039, 404); // Offer not found
        }

        // Update the offer with specified blocked status and reason
        await offer.update({
            is_blocked: blocked,
            blocked_reason: block_reason || null,
            updated_by: req.user?.id || null // Assuming user info is available in req.user
        });

        // Send notification to business owner
        const action = blocked ? 'blocked' : 'unblocked';
        const notificationMessage = blocked
            ? `Your offer "${offer.offer_title}" has been blocked by admin.${block_reason ? ` Reason: ${block_reason}` : ''}`
            : `Your offer "${offer.offer_title}" has been unblocked by admin.`;


        const promotion_data = {
            id: req.user?.id || null, // admin user id
            message: notificationMessage,
            business_id: offer.user_id, // business owner user id
            redirect_url: `/offers/${offer_id}`
        };

        const { notification_id } = await sendNotificationFromAdmin({
            data: promotion_data,
            transaction
        });

        await transaction.commit();

        const notifications = await getCurrentNotification(notification_id, ["business_owner"]);


        const message = `Offer ${action} successfully`;

        return RESPONSE.success(res, 1075, {
            message,
            is_blocked: blocked,
            blocked_reason: block_reason || null,
            offer_id: offer_id,
            notifications
        });
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { blockOffer };