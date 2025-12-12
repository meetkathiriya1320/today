import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

// Helper function to append base URL to image
const appendBaseUrl = (obj) => {
    if (obj.image) {
        obj.image = `${process.env.APP_PROJECT_PATH}${obj.image}`;
    }
    return obj;
};

// Get Category by ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await db.Category.findByPk(id);

        if (!category) {
            return RESPONSE.error(res, 2020, 404); // Category not found
        }

        const categoryWithFullUrl = appendBaseUrl(category.toJSON());

        return RESPONSE.success(res, 1012, categoryWithFullUrl);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getCategoryById };