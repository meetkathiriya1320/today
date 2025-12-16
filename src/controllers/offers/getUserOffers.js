import db from '../../models/index.js';
const { Op } = db.Sequelize;
import { RESPONSE } from '../../helper/response.js';

// Get All User Requests (Offers) for the authenticated user
const getUserOffers = async (req, res) => {
    try {
        const { status, category_id, branch_id, start_date, end_date, search, limit = 10, page = 1 } = req.query;

        // Get the authenticated user ID from request
        const userId = req.user?.userId;

        if (!userId) {
            return RESPONSE.error(res, 1053, 401);
        }

        const offset = (page - 1) * limit;

        const whereClause = {
            user_id: userId,  // Only get offers for the authenticated user
        };

        if (status) whereClause.status = status;
        if (category_id) whereClause.category_id = category_id;
        if (branch_id) whereClause.branch_id = branch_id;

        // Search functionality across multiple fields
        if (search) {
            whereClause[Op.or] = [
                {
                    offer_title: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                {
                    short_description: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                {
                    full_description: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                {
                    keywords: {
                        [Op.overlap]: [search]
                    }
                }
            ];
        }

        // Date range filtering
        if (start_date && end_date) {
            whereClause[Op.and] = [
                {
                    start_date: {
                        [Op.lte]: new Date(end_date)
                    }
                },
                {
                    [Op.or]: [
                        {
                            end_date: {
                                [Op.gte]: new Date(start_date)
                            }
                        },
                        {
                            end_date: null
                        }
                    ]
                }
            ];
        }

        const { count, rows } = await db.Offer.findAndCountAll({
            where: whereClause,
            include: [
                { model: db.Category, as: 'Category', attributes: ['id', 'name'] },
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
                { model: db.OfferImage, as: 'OfferImage', attributes: ['id', 'image'] },
                {
                    model: db.OfferRequestRejectDetails,
                    as: 'OfferRequestRejectDetails',
                    attributes: ['id', 'reason', 'rejected_by', 'created_at'],
                    required: false,
                    separate: true,
                    order: [['created_at', 'DESC']],
                    limit: 1
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);

        const offersWithFullUrl = rows.map(offer => {
            const offerJson = offer.toJSON();
            // Convert OfferRequestRejectDetails array to single object
            if (offerJson.OfferRequestRejectDetails && Array.isArray(offerJson.OfferRequestRejectDetails)) {
                offerJson.OfferRequestRejectDetails = offerJson.OfferRequestRejectDetails[0] || null;
            }
            // Model getters already handle image URL construction
            return offerJson;
        });

        return RESPONSE.success(res, 1035, {
            data: offersWithFullUrl,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getUserOffers };