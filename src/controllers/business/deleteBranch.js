import { RESPONSE } from '../../helper/response.js';
import db from '../../models/index.js';

const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.userId;

        // Find the branch
        const branch = await db.Branches.findOne({
            where: { id }

        });

        if (!branch) {
            return RESPONSE.error(res, 1026, 404);
        }

        // Check if this is the last branch for the user
        const totalBranchCount = await db.Branches.count({
            include: [
                {
                    model: db.Business,
                    where: { id: branch.business_id },
                    required: true
                }
            ]
        });

        if (totalBranchCount <= 1) {
            return RESPONSE.error(res, 5004, 400);
        }

        // Delete the branch
        await branch.destroy();

        return RESPONSE.success(res, 5003, {});
    } catch (error) {
        console.error('Error deleting branch:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { deleteBranch }