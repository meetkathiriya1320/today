import Settings from '../../models/settings.model.js';
import { RESPONSE } from '../../helper/response.js';

const editSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const { value } = req.body;

        if (!id) {
            return RESPONSE.error(res, 'Setting ID is required', 400);
        }

        if (!value) {
            return RESPONSE.error(res, 5018, 400);
        }

        const setting = await Settings.findByPk(id);

        if (!setting) {
            return RESPONSE.error(res, 5016, 404);
        }

        setting.value = value;
        await setting.save();

        return RESPONSE.success(res, 5014, setting);
    } catch (error) {
        console.error('Error editing setting:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { editSetting }