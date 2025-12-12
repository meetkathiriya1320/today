import Settings from '../../models/settings.model.js';
import { RESPONSE } from '../../helper/response.js';

const addSetting = async (req, res) => {
    try {
        const { key, value } = req.body;

        if (!key) {
            return RESPONSE.error(res, 5017, 400);
        }

        if (!value) {
            return RESPONSE.error(res, 5018, 400);
        }

        // Check if setting with this key already exists
        const existingSetting = await Settings.findOne({
            where: { key }
        });

        if (existingSetting) {
            return RESPONSE.error(res, 'Setting with this key already exists', 400);
        }

        const newSetting = await Settings.create({
            key,
            value
        });

        return RESPONSE.success(res, 5013, newSetting);
    } catch (error) {
        console.error('Error adding setting:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { addSetting }