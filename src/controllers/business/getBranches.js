import Branches from '../../models/branches.model.js';
import { RESPONSE } from '../../helper/response.js';
import { Op } from 'sequelize';

const getBranches = async (req, res) => {
    try {
        const { business_id, search, page = 1, limit = 10 } = req.query;

        if (!business_id) {
            return RESPONSE.error(res, 5020, 400);
        }

        const offset = (page - 1) * limit || 0;
        const whereClause = {
            business_id
        };

        if (search) {
            whereClause.branch_name = {
                [Op.iLike]: `%${search}%`
            };
        }

        const { count, rows } = await Branches.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });
        const totalPages = Math.ceil(count / limit);

        const response = {
            branches: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        };

        return RESPONSE.success(res, 5019, response);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { getBranches }