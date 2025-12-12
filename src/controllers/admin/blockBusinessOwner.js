import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

const blockBusinessOwner = async (req, res) => {
    const transaction = await db.sequelize.transaction()
    try {
        const { user_id, status, reason } = req.body;

        const admin_id = req.user.userId

        // Find business_owner role
        const businessOwnerRole = await db.Role.findOne({
            where: { name: 'business_owner' },
            transaction
        });

        if (!businessOwnerRole) {
            await transaction.rollback();
            return RESPONSE.error(res, 2999, 500, 'Business owner role not found');
        }

        // Update user_role for business_owner
        const [updatedRowsCount] = await db.UserRole.update(
            { is_blocked: status === 0 },
            {
                where: {
                    user_id: user_id,
                    role_id: businessOwnerRole.id
                },
                transaction
            }
        );

        const is_existing = await db.UserBlockHistory.findOne({
            where: {
                user_id: user_id
            }
        })
        if (is_existing) {
            await is_existing.update({
                blocked_by: admin_id,
                reason_for_block: reason,
                status: status === 0 ? 'blocked' : 'unblocked'
            }, { transaction })
        } else {
            await db.UserBlockHistory.create({
                user_id,
                blocked_by: admin_id,
                reason_for_block: reason,
                status: status === 0 ? 'blocked' : 'unblocked'
            }, { transaction })
        }



        if (updatedRowsCount === 0) {
            return RESPONSE.error(res, 1026, 404);
        }

        const user_status_obj = {
            0: "Block",
            1: "Unblock"
        }

        const message = `User ${user_status_obj[status]} successfully.`
        await transaction.commit()

        return RESPONSE.success(res, message, {});
    } catch (error) {
        await transaction.rollback()
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { blockBusinessOwner }