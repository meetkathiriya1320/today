import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

const declineRequestListing = async (req, res) => {
    try {

        const user_id = req.user.user_id
        const is_admin = req.user.role

        const whereCondition = {
            status: 'reject'
        };

        if (!is_admin) {
            whereCondition.user_id = user_id
        }

        const requests = await db.UnblockUserRequest.findAll({
            where: whereCondition,

        });

        return RESPONSE.success(res, 5010, requests);
    } catch (error) {
        console.error('Error getting declined requests:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { declineRequestListing }