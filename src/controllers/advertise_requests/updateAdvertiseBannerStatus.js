import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import { checkSlotAvailability } from './checkSlotAvailability.js';
import sendNotificationFromAdmin from '../../helper/sendNotificationFromAdmin.js';
import { formatDate } from '../../utils/formatDate.js';
import { getCurrentNotification } from '../notification/createNotification.js';
const { Op } = db.Sequelize;

// Update Advertise Banner Status
const updateAdvertiseBannerStatus = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { id } = req.params;
        const { status, note, is_active } = req.body;

        // First check if the advertise request exists
        const advertiseRequest = await db.AdvertiseRequest.findByPk(id, {
            include: [
                {
                    model: db.AdvertiseBanner,
                    as: 'AdvertiseBanner'
                }
            ],
            transaction
        });

        if (!advertiseRequest) {
            await transaction.rollback();
            return RESPONSE.error(res, 1030, 404); // Advertise request not found
        }

        if (!advertiseRequest.AdvertiseBanner) {
            await transaction.rollback();
            return RESPONSE.error(res, 1032, 404); // Advertise banner not found
        }

        // Check if we're trying to approve this banner
        if (status === 'approved') {
            // Parse dates for slot availability checking
            const parseDate = (dateValue) => {
                // If already a Date object, return as is
                if (dateValue instanceof Date) {
                    return dateValue;
                }

                // Convert to string if needed
                const dateString = dateValue.toString();

                if (dateString.includes('-') && dateString.split('-').length === 3) {
                    const [year, month, day] = dateString.split('-').map(Number);
                    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
                }
                return new Date(dateString);
            };

            const startDateUTC = parseDate(advertiseRequest.start_date);
            const endDateUTC = parseDate(advertiseRequest.end_date);
            // Check slot availability using latitude/longitude, excluding the current request from count
            const slotCheckResult = await checkSlotAvailability(
                advertiseRequest.city,
                startDateUTC,
                endDateUTC,
                advertiseRequest.id
            );

            if (!slotCheckResult.available) {
                await transaction.rollback();
                return RESPONSE.error(res, 1052, 409, null, {
                    slot_available_in: slotCheckResult.availableIn,
                    current_slot_count: slotCheckResult.currentSlotCount,
                    max_slots: slotCheckResult.maxSlots,
                    location: advertiseRequest.location,
                    city: advertiseRequest.city,
                    latitude: advertiseRequest.latitude,
                    longitude: advertiseRequest.longitude,
                    start_date: startDateUTC.toISOString(),
                    end_date: endDateUTC.toISOString(),
                    time_period: `${advertiseRequest.start_date} to ${advertiseRequest.end_date}`
                });
            }
        }

        // Update the banner status
        await advertiseRequest.AdvertiseBanner.update({
            ...(status !== undefined && { status }),
            ...(note !== undefined && { note }),
            ...(is_active !== undefined && { is_active }),
            updated_by: req.user?.userId || null
        }, { transaction });

        // If status is approved, find and update existing payment record
        let payment = null;
        if (status === 'approved') {
            // Find existing payment record for this banner
            payment = await db.Payment.findOne({
                where: { ad_id: advertiseRequest.AdvertiseBanner.id },
                transaction
            });

            if (payment) {
                // Update existing payment to completed
                await payment.update({
                    status: 'completed',
                    updated_by: req.user?.userId || null
                }, { transaction });
            }
        }

        const promotion_data = {
            id: req.user?.userId,
            message: status ? `Your Promotion request from ${formatDate(advertiseRequest.start_date)} to ${formatDate(advertiseRequest.end_date)} has been ${status}` :
                `Your promotion banner from ${formatDate(advertiseRequest.start_date)} to ${formatDate(advertiseRequest.end_date)} is ${is_active ? "started" : "paused"}.`,
            business_id: advertiseRequest.user_id,
            redirect_url: status ? "/promotions" : null
        }

        const { notification_id } = await sendNotificationFromAdmin({
            data: promotion_data,
            transaction
        });

        await transaction.commit();

        const notifications = await getCurrentNotification(notification_id, ["business_owner"]);


        return RESPONSE.success(res, 1033, {
            advertise_request: advertiseRequest,
            banner_status: status,
            notifications,
            note: note || null,
            payment: payment ? {
                id: payment.id,
                payment_method: payment.payment_method,
                date: payment.date,
                check_number: payment.check_number,
                transaction_id: payment.transaction_id,
                status: payment.status,
                create_by: payment.create_by,
                created_at: payment.created_at
            } : null
        });
    } catch (error) {
        await transaction.rollback();
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { updateAdvertiseBannerStatus };