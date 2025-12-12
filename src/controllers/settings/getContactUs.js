import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

const getContactUs = async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;

        const offset = (page - 1) * limit;

        const { count, rows } = await db.ContactUs.findAndCountAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        if (!rows || rows.length === 0) {
            return RESPONSE.success(res, 1070, 404);
        }

        const totalPages = Math.ceil(count / limit);

        return RESPONSE.success(res, 1069, {
            data: rows,
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

export { getContactUs };