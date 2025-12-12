import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

const approveDeclineBlockRequest = async (req, res) => {
    try {
        const { request_id, action, reason } = req.body;
        const admin_id = req.user.userId;

        const request = await db.UnblockUserRequest.findByPk(request_id);
        if (!request) {
            return RESPONSE.error(res, 1026, 404);
        }


        const getRole = await db.Role.findOne({
            where: {
                name: 'business_owner'
            },
            raw: true
        });

        const role_id = getRole.id


        if (action === 'approve') {
            await db.UserRole.update({ is_blocked: false }, { where: { user_id: request.user_id, role_id } });
            await request.update({ status: 'approved', updated_by: admin_id });
            await db.UserBlockHistory.update({
                status: "unblocked",
                updated_by: admin_id,
            },
                {
                    where: {
                        user_id: request.user_id
                    }
                })
        } else if (action === 'decline') {
            await request.update({ status: 'rejected', decline_reason: reason, updated_by: admin_id });

        }

        const message = `${action.charAt(0).toUpperCase() + action.slice(1)} request successfully`;


        return RESPONSE.success(res, message, {});
    } catch (error) {
        console.error('Error approving/declining block request:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { approveDeclineBlockRequest }