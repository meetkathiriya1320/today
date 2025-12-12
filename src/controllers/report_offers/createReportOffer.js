import db from "../../models/index.js";
import { RESPONSE } from "../../helper/response.js";

const createReportOffer = async (req, res) => {
    try {
        const { offer_id, branch_id, note } = req.body;
        const user_id = req.user.userId;

        // Validate required fields
        if (!offer_id || !branch_id) {
            return RESPONSE.error(res, 1041, 400);
        }

        // Create report
        const report = await db.OfferReport.create({
            offer_id,
            branch_id,
            note,
            user_id
        });

        return RESPONSE.success(res, 5037, report); // Assuming 5037 for report created
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { createReportOffer }