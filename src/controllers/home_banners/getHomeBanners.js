import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';



// Get All Home Banners
const getHomeBanners = async (req, res) => {
    try {
        const homeBanners = await db.HomeBanner.findAll({
            order: [['position', 'ASC'], ['created_at', 'DESC']]
        });

        return RESPONSE.success(res, 1021, homeBanners);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getHomeBanners };