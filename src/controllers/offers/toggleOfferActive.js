import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

const toggleOfferActive = async (req, res) => {
    try {
        const { offer_id } = req.query;

        if (!offer_id) {
            return RESPONSE.error(res, 5035, 400); // Assuming 5035 is for missing params
        }

        const offer = await db.Offer.findByPk(offer_id);

        if (!offer) {
            return RESPONSE.error(res, 1039, 404); // Offer not found
        }

        // Toggle is_active
        await offer.update({
            is_active: !offer.is_active
        });

        return RESPONSE.success(res, 1037, { message: 'Offer status updated successfully', is_active: offer.is_active });
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { toggleOfferActive };