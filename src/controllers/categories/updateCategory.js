import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

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

        // Model getters already handle image URL construction
        const updatedCategory = category.toJSON();

        return RESPONSE.success(res, 1013, updatedCategory);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { updateCategory };