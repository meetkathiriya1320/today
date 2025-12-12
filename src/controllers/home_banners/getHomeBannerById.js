import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';



// Get Home Banner by ID
const getHomeBannerById = async (req, res) => {
    try {
        const { id } = req.params;

        const homeBanner = await db.HomeBanner.findByPk(id);

        if (!homeBanner) {
            return RESPONSE.error(res, 2020, 404); // Home banner not found
        }



        return RESPONSE.success(res, 1022, homeBanner);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getHomeBannerById };