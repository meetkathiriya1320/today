import { Op } from "sequelize";
import { RESPONSE } from "../../helper/response.js";
import db from "../../models/index.js";


const getUniqueCity = async (req, res) => {
    try {

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);


        const uniqueCity = await db.Branches.findAll({
            attributes: [
                'city'
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
                    attributes: []
                }
            ],
            raw: true
        });

        // one array in all city and exclude null value and match unique uppercase and lowercase
        const cities =
            [...new Set(
                uniqueCity
                    .map(c => c.city?.toLowerCase())
                    .filter(c => c)
            )].sort();

        return RESPONSE.success(res, 1071, cities);

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getUniqueCity };