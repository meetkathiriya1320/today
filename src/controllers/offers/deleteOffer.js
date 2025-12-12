import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

// Soft Delete Offer
const deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;

        const offer = await db.Offer.findByPk(id);

        if (!offer) {
            return RESPONSE.error(res, 1039, 404); // Offer not found
        }

        // Soft delete the offer (sets deleted_at timestamp)
        await offer.destroy();

        return RESPONSE.success(res, 1038);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { deleteOffer };