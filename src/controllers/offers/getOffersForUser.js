import { Op } from "sequelize";
import { RESPONSE } from "../../helper/response.js";
import db from "../../models/index.js";

const getOffersForUser = async (req, res) => {
    try {

        const { city, category_id } = req.query;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const getOfferForUser = await db.Offer.findAll({
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
                ...(category_id && { category_id })
            },
            include: [
                {
                    model: db.Branches,
                    where: {
                        city: {
                            [Op.iLike]: city
                        }
                    },
                    required: true

                },
                { model: db.OfferImage, as: 'OfferImage', attributes: ['id', 'image'] },
                { model: db.Category, as: 'Category', attributes: ['id', 'name'] },
            ]
        })
        return RESPONSE.success(res, 1035, getOfferForUser)
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { getOffersForUser };
