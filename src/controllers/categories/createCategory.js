import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

// Create Category
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const image = req.file ? `/images/${req.file.filename}` : null;

        if (!name) {
            return RESPONSE.error(res, 2019, 400); // Name is required
        }

        const category = await db.Category.create({
            name,
            image,
            created_by: req.user.userId
        });

        // Model getters already handle image URL construction
        const categoryWithFullUrl = category.toJSON();

        return RESPONSE.success(res, 1010, categoryWithFullUrl, 201);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { createCategory };