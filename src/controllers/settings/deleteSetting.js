import Settings from '../../models/settings.model.js';
import { RESPONSE } from '../../helper/response.js';

const deleteSetting = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return RESPONSE.error(res, 'Setting ID is required', 400);
        }

        const setting = await Settings.findByPk(id);

        if (!setting) {
            return RESPONSE.error(res, 5016, 404);
        }

        await setting.destroy();

        return RESPONSE.success(res, 5015);
    } catch (error) {
        console.error('Error deleting setting:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { deleteSetting }