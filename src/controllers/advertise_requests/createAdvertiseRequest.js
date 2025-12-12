import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import { checkSlotAvailability } from './checkSlotAvailability.js';
import sendRequestNotification from '../../helper/sendRequestNotification.js';
import { getCurrentNotification } from '../notification/createNotification.js';
import sendNotificationFromAdmin from '../../helper/sendNotificationFromAdmin.js';
import { formatDate } from '../../utils/formatDate.js';
const { Op } = db.Sequelize;

// Helper function to append base URL to image
const appendBaseUrl = (obj) => {
    if (obj.image) {
        obj.image = `${process.env.APP_PROJECT_PATH}${obj.image}`;
    }
    return obj;
};

// Create Advertise Request
const createAdvertiseRequest = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { branch_id, start_date, end_date, offer_url, external_url, amount, transaction_id, check_number, payment_method } = req.body;
        const image = req.file ? `/images/${req.file.filename}` : null;

        // Use authenticated user's ID
        const user_id = req.user?.userId;
        if (!user_id || !start_date || !end_date || !branch_id) {
            await transaction.rollback();
            return RESPONSE.error(res, 1028, 400); // Required fields missing
        }

        const branch_data = await db.Branches.findByPk(branch_id, {
            attributes: ['city'],
            include: [
                {
                    model: db.Business,
                    as: "Business",
                    attributes: ["id", "user_id", "business_name"],
                }
            ],

        });

        const city = branch_data.city

        // Validate payment fields if any payment information is provided
        if (transaction_id || check_number || payment_method) {
            if (!payment_method) {
                await transaction.rollback();
                return RESPONSE.error(res, 1047, 400); // Payment method is required when payment details are provided
            }

            // Validate payment method enum
            const validPaymentMethods = ['credit_card', 'debit_card', 'bank_transfer', 'check', 'cash', 'online'];
            if (!validPaymentMethods.includes(payment_method)) {
                await transaction.rollback();
                return RESPONSE.error(res, 1048, 400); // Invalid payment method
            }

            // For check payments, check_number is required
            if (payment_method === 'check' && !check_number) {
                await transaction.rollback();
                return RESPONSE.error(res, 1049, 400); // Check number is required for check payments
            }

            // For card/online payments, transaction_id is required
            if (['credit_card', 'debit_card', 'online'].includes(payment_method) && !transaction_id) {
                await transaction.rollback();
                return RESPONSE.error(res, 1050, 400); // Transaction ID is required for card/online payments
            }
        }

        // Parse dates from YY/MM/DD format (e.g., "2025-12-31")
        const parseDate = (dateString) => {
            // Handle YY/MM/DD format (2025-12-31)
            if (dateString.includes('-') && dateString.split('-').length === 3) {
                const [year, month, day] = dateString.split('-').map(Number);
                // Create date at midnight UTC of the specified date
                return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
            }
            // Fallback to ISO format parsing
            return new Date(dateString);
        };

        const startDateUTC = parseDate(start_date);
        const endDateUTC = parseDate(end_date);

        // Validate dates
        if (isNaN(startDateUTC.getTime()) || isNaN(endDateUTC.getTime()) || startDateUTC > endDateUTC) {
            return RESPONSE.error(res, 1045, 400); // Invalid date range
        }

        // Check if slot is available using the reusable function with latitude/longitude
        const slotCheckResult = await checkSlotAvailability(city, startDateUTC, endDateUTC);
        if (!slotCheckResult.available) {
            return RESPONSE.error(res, 'Slot is not available', 409, null, {
                slot_available_in: slotCheckResult.availableIn,
                current_slot_count: slotCheckResult.currentSlotCount,
                max_slots: slotCheckResult.maxSlots,
                requested_start_date: startDateUTC.toISOString(),
                requested_end_date: endDateUTC.toISOString(),
                city: city

            });
        }

        // Create advertise request
        const advertiseRequest = await db.AdvertiseRequest.create({
            user_id,
            image,
            start_date,
            end_date,
            offer_url: offer_url || null,
            external_url: external_url || null,
            create_by: req.user?.userId || null,
            city


        }, { transaction });

        // Automatically create advertise banner
        const advertiseBanner = await db.AdvertiseBanner.create({
            request_id: advertiseRequest.id,
            status: 'pending',
            create_by: req.user?.userId || null,
            is_active: false
        }, { transaction });

        // Create payment record if payment information is provided
        let paymentRecord = null;
        if (payment_method) {
            // Use current date for payment
            const paymentDate = new Date();

            paymentRecord = await db.Payment.create({
                ad_id: advertiseBanner.id,
                payment_method,
                amount,
                date: paymentDate,
                check_number: check_number || null,
                transaction_id: transaction_id || null,
                status: 'pending', // Assuming payment is completed when creating request
                create_by: req.user?.userId || null,
                updated_by: req.user?.userId || null
            }, { transaction });
        };

        const promotion_data = {
            id: user_id,
            business_name: branch_data.Business.business_name,
            type: "Promotion",
            redirect_url: "/admin/promotions"
        }
        const { notification_id } = await sendRequestNotification({
            data: promotion_data,
            transaction
        });

        await transaction.commit();

        const notifications = await getCurrentNotification(notification_id, ["admin"]);


        const advertiseRequestWithFullUrl = advertiseRequest.toJSON();
        advertiseRequestWithFullUrl.advertise_banner = advertiseBanner;

        return RESPONSE.success(
            res,
            1029,
            {
                advertise: advertiseRequestWithFullUrl,
                notifications,
                payment: paymentRecord ? paymentRecord.get({ plain: true }) : null
            },
            201
        );

    } catch (error) {
        await transaction.rollback();
        return RESPONSE.error(res, 2999, 500, error);
    }
};

const createAdvertiseRequest_admin = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { business_id, branch_id, start_date, end_date, offer_url, external_url, transaction_id, check_number, payment_method, amount } = req.body;
        const image = req.file ? `/images/${req.file.filename}` : null;

        if (!start_date || !end_date || !branch_id) {
            await transaction.rollback();
            return RESPONSE.error(res, 1028, 400); // Required fields missing
        }

        const branch_data = await db.Branches.findByPk(branch_id, {
            attributes: ['city'],
            raw: true
        });

        const city = branch_data.city


        // Validate payment fields if any payment information is provided
        if (transaction_id || check_number || payment_method) {
            if (!payment_method) {
                await transaction.rollback();
                return RESPONSE.error(res, 1047, 400); // Payment method is required when payment details are provided
            }

            // Validate payment method enum
            const validPaymentMethods = ['credit_card', 'debit_card', 'bank_transfer', 'check', 'cash', 'online'];
            if (!validPaymentMethods.includes(payment_method)) {
                await transaction.rollback();
                return RESPONSE.error(res, 1048, 400); // Invalid payment method
            }

            // For check payments, check_number is required
            if (payment_method === 'check' && !check_number) {
                await transaction.rollback();
                return RESPONSE.error(res, 1049, 400); // Check number is required for check payments
            }

            // For card/online payments, transaction_id is required
            if (['credit_card', 'debit_card', 'online'].includes(payment_method) && !transaction_id) {
                await transaction.rollback();
                return RESPONSE.error(res, 1050, 400); // Transaction ID is required for card/online payments
            }
        }

        // Parse dates from YY/MM/DD format (e.g., "2025-12-31")
        const parseDate = (dateString) => {
            // Handle YY/MM/DD format (2025-12-31)
            if (dateString.includes('-') && dateString.split('-').length === 3) {
                const [year, month, day] = dateString.split('-').map(Number);
                // Create date at midnight UTC of the specified date
                return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
            }
            // Fallback to ISO format parsing
            return new Date(dateString);
        };

        const startDateUTC = parseDate(start_date);
        const endDateUTC = parseDate(end_date);

        // Validate dates
        if (isNaN(startDateUTC.getTime()) || isNaN(endDateUTC.getTime()) || startDateUTC > endDateUTC) {
            return RESPONSE.error(res, 1045, 400); // Invalid date range
        }
        // Check if slot is available using the reusable function with latitude/longitude
        const slotCheckResult = await checkSlotAvailability(city, startDateUTC, endDateUTC);
        if (!slotCheckResult.available) {
            return RESPONSE.error(res, 'Slot is not available', 409, null, {
                slot_available_in: slotCheckResult.availableIn,
                current_slot_count: slotCheckResult.currentSlotCount,
                max_slots: slotCheckResult.maxSlots,
                requested_start_date: startDateUTC.toISOString(),
                requested_end_date: endDateUTC.toISOString(),
                city: city

            });
        }
        // get business id to user id
        const business = await db.Business.findOne({
            where: { id: business_id }
        });
        const user_id = business?.user_id;
        // Create advertise request
        const advertiseRequest = await db.AdvertiseRequest.create({
            image,
            user_id,
            start_date,
            end_date,
            offer_url: offer_url || null,
            external_url: external_url || null,
            create_by: req.user?.userId || null,
            city


        }, { transaction });

        // Automatically create advertise banner
        const advertiseBanner = await db.AdvertiseBanner.create({
            request_id: advertiseRequest.id,
            status: 'approved',
            create_by: req.user?.userId || null,
            is_active: true
        }, { transaction });

        // Create payment record if payment information is provided
        let paymentRecord = null;
        if (payment_method) {
            // Use current date for payment
            const paymentDate = new Date();

            paymentRecord = await db.Payment.create({
                ad_id: advertiseBanner.id,
                payment_method,
                amount,
                date: paymentDate,
                check_number: check_number || null,
                transaction_id: transaction_id || null,
                status: 'completed', // Assuming payment is completed when creating request
                create_by: req.user?.userId || null,
                updated_by: req.user?.userId || null
            }, { transaction });
        }

        const promotion_data = {
            id: req.user?.userId,
            message: `A promotion has been created by the admin from ${formatDate(start_date)} to ${formatDate(end_date)}.`,
            business_id: user_id,
            redirect_url: "/promotions"

        }
        const { notification_id } = await sendNotificationFromAdmin({
            data: promotion_data,
            transaction
        });

        await transaction.commit();

        const notifications = await getCurrentNotification(notification_id, ["business_owner"]);

        const advertiseRequestWithFullUrl = advertiseRequest.toJSON();
        advertiseRequestWithFullUrl.advertise_banner = advertiseBanner;

        return RESPONSE.success(
            res,
            1029,
            {
                advertise: advertiseRequestWithFullUrl,
                notifications,
                payment: paymentRecord ? paymentRecord.get({ plain: true }) : null
            },
            201
        );

    } catch (error) {
        console.log(error)
        await transaction.rollback();
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { createAdvertiseRequest, createAdvertiseRequest_admin };