import Settings from '../../models/settings.model.js';
import { RESPONSE } from '../../helper/response.js';

const getSettings = async (req, res) => {
    try {
        const { key } = req.query;

        if (key) {
            // Get setting by key
            const setting = await Settings.findOne({
                where: {
                    key
                }
            });

            if (!setting) {
                return RESPONSE.success(res, 5059, 404);
            }

            return RESPONSE.success(res, 5012, setting);
        } else {
            // Get all settings
            const settings = await Settings.findAll();

            return RESPONSE.success(res, 5012, settings);
        }
    } catch (error) {
        console.error('Error getting settings:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { getSettings }