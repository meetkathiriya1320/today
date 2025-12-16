import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import sendNotificationFromAdmin from '../../helper/sendNotificationFromAdmin.js';
import { getCurrentNotification } from '../notification/createNotification.js';


// Update Offer Status (Admin only)
const updateOfferStatus = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        const updated_by = req.user.userId

        // Validate status
        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!status || !validStatuses.includes(status)) {
            await transaction.rollback();
            return RESPONSE.error(res, 1042, 400); // Invalid status
        }

        const offer = await db.Offer.findByPk(id, {
            include: [
                {
                    model: db.Category,
                    as: 'Category',
                    attributes: ['id', 'name']
                },
                {
                    model: db.Branches,
                    attributes: ['id', 'branch_name'],
                    include: [
                        {
                            model: db.Business,
                            as: 'Business',
                            attributes: ['id', 'business_name']
                        }
                    ]
                },
                {
                    model: db.User,
                    as: 'User',
                    attributes: ['id', 'email'],
                    include: [
                        {
                            model: db.UserRole,
                            as: 'UserRoles',
                            attributes: ['first_name', 'last_name']
                        }
                    ]
                }
            ]
        }, { transaction });

        if (!offer) {
            await transaction.rollback();
            return RESPONSE.error(res, 1039, 404); // Offer not found
        }

        // If rejecting, create a record in offer_request_reject_details
        if (status === 'rejected') {
            if (!reason) {
                await transaction.rollback();
                return RESPONSE.error(res, 1045, 400); // Reason is required for rejection
            }

            await db.OfferRequestRejectDetails.create({
                offer_id: offer.id,
                reason: reason,
                rejected_by: req.user?.userId || null
            }, { transaction });
        }

        // Update offer status
        await offer.update({
            status: status,
            updated_by
        }, { transaction });



        // Fetch updated offer with rejection details and images
        const updatedOffer = await db.Offer.findByPk(id, {
            include: [
                {
                    model: db.Category,
                    as: 'Category',
                    attributes: ['id', 'name']
                },
                {
                    model: db.Branches,
                    attributes: ['id', 'branch_name'],
                    include: [
                        {
                            model: db.Business,
                            as: 'Business',
                            attributes: ['id', 'business_name']
                        }
                    ]
                },
                {
                    model: db.User,
                    as: 'User',
                    attributes: ['id', 'email'],
                    include: [
                        {
                            model: db.UserRole,
                            as: 'UserRoles',
                            attributes: ['first_name', 'last_name']
                        }
                    ]
                },
                {
                    model: db.OfferImage,
                    as: 'OfferImage',
                    attributes: ['id', 'image']
                },
                {
                    model: db.OfferRequestRejectDetails,
                    as: 'OfferRequestRejectDetails',
                    attributes: ['id', 'reason', 'created_at'],
                    required: false,
                    separate: true,
                    order: [['created_at', 'DESC']],
                    limit: 1
                }
            ]
        });

        // Apply base URL to images
        const offerJson = updatedOffer.toJSON();


        // Add first_name and last_name from UserRoles to User
        if (offerJson.User) {
            offerJson.User.first_name = offerJson.User.UserRoles?.[0]?.first_name || '';
            offerJson.User.last_name = offerJson.User.UserRoles?.[0]?.last_name || '';
        }

        // Convert OfferRequestRejectDetails array to single object
        if (offerJson.OfferRequestRejectDetails && Array.isArray(offerJson.OfferRequestRejectDetails)) {
            offerJson.OfferRequestRejectDetails = offerJson.OfferRequestRejectDetails[0] || null;
        }
        // Model getters already handle image URL construction
        const offerWithFullUrl = offerJson;

        // notification send logic

        const businessOwnerRole = await db.Role.findOne({
            where: { name: 'business_owner' },
            transaction
        });


        const promotion_data = {
            id: req.user?.userId,
            message: `Your ${offerJson.offer_title} Offer is ${status}`,
            business_id: offerJson.User.id,
            role_id: businessOwnerRole.id,
            redirect_url: "/offers"
        }

        const { notification_id } = await sendNotificationFromAdmin({
            data: promotion_data,
            transaction
        });

        await transaction.commit();

        const notifications = await getCurrentNotification(notification_id, ["business_owner"]);

        return RESPONSE.success(res, 1043, { ...offerWithFullUrl, notifications });
    } catch (error) {
        await transaction.rollback();
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { updateOfferStatus };