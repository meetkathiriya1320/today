import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

// Delete Home Banner
const deleteHomeBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const homeBanner = await db.HomeBanner.findByPk(id);

        if (!homeBanner) {
            return RESPONSE.error(res, 2020, 404); // Home banner not found
        }

        await homeBanner.destroy();

        return RESPONSE.success(res, 1024);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { deleteHomeBanner };