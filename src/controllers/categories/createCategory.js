import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

// Helper function to append base URL to image
const appendBaseUrl = (obj) => {
    if (obj.image) {
        obj.image = `${process.env.APP_PROJECT_PATH}${obj.image}`;
    }
    return obj;
};

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

        const categoryWithFullUrl = appendBaseUrl(category.toJSON());

        return RESPONSE.success(res, 1010, categoryWithFullUrl, 201);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { createCategory };