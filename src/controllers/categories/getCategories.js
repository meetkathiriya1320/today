import { Op } from 'sequelize';
import { RESPONSE } from '../../helper/response.js';
import db from '../../models/index.js';

// Get All Categories
const getCategories = async (req, res) => {
    try {
        const { city } = req.query; // Get location and city parameters from query string

        // for admin
        if (!city) {
            const category = await db.Category.findAll({
                order: [["created_at", "DESC"]]
            })
            return RESPONSE.success(res, 1011, category)
        }

        // for user
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const cityWiseCat = await db.Category.findAll({
            attributes: [
                "id",
                "name",
                "image"
            ],
            include: [
                {
                    required: true,
                    model: db.Offer,
                    where: {
                        status: "approved",
                        is_active: true,
                        is_blocked: false,
                        start_date: {
                            [Op.lte]: new Date()
                        },
                        [Op.or]: [
                            {
                                end_date: {
                                    [Op.gte]: todayStart
                                }
                            },
                            { end_date: null }

                        ],
                    },
                    include: [
                        {
                            model: db.Branches,
                            where: {
                                 city: {
                                    [Op.iLike]: city
                                }
                            },

                        }
                    ]

                }
            ],
        });

        const cityWiseCatCountWise = cityWiseCat.map(cat => {
            const json = cat.toJSON();
            json.offer_count = json.Offers.length;
            return json;
        });

        return RESPONSE.success(res, 1011, cityWiseCatCountWise);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getCategories };
