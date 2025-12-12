import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

// Delete Category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await db.Category.findByPk(id);

        if (!category) {
            return RESPONSE.error(res, 2020, 404); // Category not found
        }

        await category.destroy();

        return RESPONSE.success(res, 1014);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { deleteCategory };