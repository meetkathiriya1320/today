import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

// Get Category by ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await db.Category.findByPk(id);

        if (!category) {
            return RESPONSE.error(res, 2020, 404); // Category not found
        }

        // Model getters already handle image URL construction
        const categoryWithFullUrl = category.toJSON();

        return RESPONSE.success(res, 1012, categoryWithFullUrl);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getCategoryById };