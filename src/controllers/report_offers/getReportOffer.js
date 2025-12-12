import db from "../../models/index.js";
import { RESPONSE } from "../../helper/response.js";

const getReportOffer = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        const { count, rows } = await db.OfferReport.findAndCountAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: db.Offer,
                    as: 'Offer',
                    attributes: ['id', 'offer_title', 'short_description'],
                },
                {
                    model: db.User,
                    as: 'User',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: db.Business,
                    as: 'Business',
                    attributes: ['id', 'business_name']
                }
            ]
        });

        const totalPages = Math.ceil(count / limit);

        const response = {
            reports: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        };

        return RESPONSE.success(res, 5038, response); // Assuming 5038 for reports retrieved
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getReportOffer }