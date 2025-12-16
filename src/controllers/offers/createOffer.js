import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import sendRequestNotification from '../../helper/sendRequestNotification.js';
import { getCurrentNotification } from '../notification/createNotification.js';
import sendNotificationFromAdmin from '../../helper/sendNotificationFromAdmin.js';
import { appendBaseUrl } from '../images/serveImage.js';

// Create Offer
const createOffer = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { category_id, branch_id, offer_title, short_description, full_description, start_date, end_date, keywords, is_active } = req.body;

        // Use authenticated user's ID

        const branch = await db.Branches.findOne({
            where: { id: branch_id },
            include: [
                {
                    model: db.Business,
                    as: "Business",
                    attributes: ["id", "user_id", "business_name"],
                }
            ],
        });

        const user_id = branch.Business.user_id;
        if (!user_id || !category_id || !branch_id || !offer_title || !start_date) {
            await transaction.rollback();
            return RESPONSE.error(res, 1041, 400); // Required fields missing
        }

        // Parse keywords from JSON string to array if it exists
        let parsedKeywords = null;
        if (keywords) {
            try {
                parsedKeywords = typeof keywords === 'string' ? JSON.parse(keywords) : keywords;
            } catch (error) {
                // If parsing fails, try to convert string to array
                parsedKeywords = Array.isArray(keywords) ? keywords : [keywords];
            }
        }

        // Create offer
        const offer = await db.Offer.create({
            category_id,
            branch_id,
            offer_title,
            short_description: short_description || null,
            full_description: full_description || null,
            start_date,
            end_date: end_date || null,
            keywords: parsedKeywords,
            user_id,
            status: 'pending',
            is_active
        }, { transaction });

        // Handle image upload
        if (req.file) {
            const image = `/images/${req.file.filename}`;
            await db.OfferImage.create({
                offer_id: offer.id,
                image: image
            }, { transaction });
        }

        const offer_data = {
            id: user_id,
            business_name: branch.Business.business_name,
            type: "Offer",
            redirect_url: "/admin/offer-management"
        }

        const { notification_id } = await sendRequestNotification({
            data: offer_data,
            transaction
        });

        await transaction.commit();

        const notifications = await getCurrentNotification(notification_id, ["admin"]);


        // Fetch offer with images
        const offerWithImages = await db.Offer.findByPk(offer.id, {
            include: [
                {
                    model: db.OfferImage,
                    as: 'OfferImage',
                    attributes: ['id', 'image']
                }
            ]
        });

        // Apply base URL to images using the new utility function
        const offerWithFullUrl = appendBaseUrl(offerWithImages.toJSON());

        return RESPONSE.success(res, 1034, { ...offerWithFullUrl, notifications }, 201);
    } catch (error) {
        await transaction.rollback();
        return RESPONSE.error(res, 2999, 500, error);
    }
};

const createOffer_admin = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { category_id, branch_id, offer_title, short_description, full_description, start_date, end_date, keywords, is_active } = req.body;

        // Use authenticated user's ID

        if (!category_id || !branch_id || !offer_title || !start_date) {
            await transaction.rollback();
            return RESPONSE.error(res, 1041, 400); // Required fields missing
        }

        // Parse keywords from JSON string to array if it exists
        let parsedKeywords = null;
        if (keywords) {
            try {
                parsedKeywords = typeof keywords === 'string' ? JSON.parse(keywords) : keywords;
            } catch (error) {
                // If parsing fails, try to convert string to array
                parsedKeywords = Array.isArray(keywords) ? keywords : [keywords];
            }
        }

        // business user id get

        const business_data = await db.Branches.findByPk(branch_id, {
            include: [
                {
                    model: db.Business,
                    include: [
                        {
                            model: db.User
                        }
                    ]
                }
            ]
        })

        const user_id = business_data.Business.User.id

        // Create offer
        const offer = await db.Offer.create({
            category_id,
            branch_id,
            offer_title,
            short_description: short_description || null,
            full_description: full_description || null,
            start_date,
            end_date: end_date || null,
            keywords: parsedKeywords,
            user_id,
            status: 'approved',
            is_active
        }, { transaction });

        // Handle image upload
        if (req.file) {
            const image = `/images/${req.file.filename}`;
            await db.OfferImage.create({
                offer_id: offer.id,
                image: image
            }, { transaction });
        }

        const promotion_data = {
            id: req.user?.userId,
            message: `Your ${offer_title} Offer created by admin`,
            business_id: user_id,
            redirect_url: "/offers"
        }

        const { notification_id } = await sendNotificationFromAdmin({
            data: promotion_data,
            transaction
        });


        await transaction.commit();

        const notifications = await getCurrentNotification(notification_id, ["business_owner"]);

        // Fetch offer with images
        const offerWithImages = await db.Offer.findByPk(offer.id, {
            include: [
                {
                    model: db.OfferImage,
                    as: 'OfferImage',
                    attributes: ['id', 'image']
                }
            ]
        });

        // Apply base URL to images using the new utility function
        const offerWithFullUrl = appendBaseUrl(offerWithImages.toJSON());

        return RESPONSE.success(res, 1034, { ...offerWithFullUrl, notifications }, 201);
    } catch (error) {
        await transaction.rollback();
        return RESPONSE.error(res, 2999, 500, error);
    }
};


export { createOffer, createOffer_admin };