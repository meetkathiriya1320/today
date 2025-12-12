import Business from '../../models/business.model.js';
import { RESPONSE } from '../../helper/response.js';
import db from '../../models/index.js';

const getBusiness = async (req, res) => {
    try {
        const { id } = req.query;
        const user_id = req.user.userId;

        const is_admin = req.user.role === "admin";

        const whereCondition = {

        };

        if (!is_admin) {
            whereCondition.user_id = user_id
        }

        if (id) {
            whereCondition.id = id
        }

        if (id) {
            // Get business by id
            const business = await Business.findOne({
                where: whereCondition,
                include: [
                    {
                        model: db.Branches,
                        as: "branches"
                    },
                    {
                        model: db.BusinessImage,
                        as: "business_images"
                    }
                ]
            });

            if (!business) {
                return RESPONSE.error(res, 1026, 404);
            }

            return RESPONSE.success(res, 1025, business);
        } else {
            // Get all businesses for the user
            const businesses = await Business.findAll({
                where: whereCondition,
                include: [
                    {
                        model: db.Branches,
                        as: "branches"
                    },
                    {
                        model: db.BusinessImage,
                        as: "business_images"
                    }
                ]
            });

            return RESPONSE.success(res, 1025, businesses);
        }
    } catch (error) {
        console.error('Error getting business:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { getBusiness }