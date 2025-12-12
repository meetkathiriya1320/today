import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

// Create Home Banner
const createHomeBanner = async (req, res) => {
    try {
        const { position, redirect_url } = req.body;
        const image = req.file ? `/images/${req.file.filename}` : null;

        if (!image) {
            return RESPONSE.error(res, 1062, 400); // Image is required
        }

        const homeBanner = await db.HomeBanner.create({
            image,
            position: position || null,
            redirect_url: redirect_url || null,
            is_active: true,
            created_by: req.user.userId
        });


        return RESPONSE.success(res, 1020, homeBanner, 201);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { createHomeBanner };