import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

// Helper function to append base URL to image
const appendBaseUrl = (obj) => {
    if (obj.image) {
        obj.image = `${process.env.APP_PROJECT_PATH}${obj.image}`;
    }
    return obj;
};

// Update Category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const image = req.file ? `/images/${req.file.filename}` : undefined;

        const category = await db.Category.findByPk(id);

        if (!category) {
            return RESPONSE.error(res, 2020, 404); // Category not found
        }

        await category.update({
            ...(name && { name }),
            ...(image !== undefined && { image }),
            updated_by: req.user.userId
        });

        const updatedCategory = appendBaseUrl(category.toJSON());

        return RESPONSE.success(res, 1013, updatedCategory);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { updateCategory };