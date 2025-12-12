import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

// Helper function to append base URL to image
const appendBaseUrl = (obj) => {
    if (obj.image) {
        obj.image = `${process.env.APP_PROJECT_PATH}${obj.image}`;
    }
    return obj;
};

// Update Home Banner
const updateHomeBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { position, redirect_url, is_active } = req.body;
        const image = req.file ? `/images/${req.file.filename}` : undefined;

        const homeBanner = await db.HomeBanner.findByPk(id);

        if (!homeBanner) {
            return RESPONSE.error(res, 2020, 404); // Home banner not found
        }

        await homeBanner.update({
            ...(image !== undefined && { image }),
            ...(position !== undefined && { position }),
            ...(redirect_url !== undefined && { redirect_url }),
            ...(is_active !== undefined && { is_active }),
            updated_by: req.user.userId
        });

        const updatedHomeBanner = appendBaseUrl(homeBanner.toJSON());

        return RESPONSE.success(res, 1023, updatedHomeBanner);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { updateHomeBanner };