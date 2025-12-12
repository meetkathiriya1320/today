import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import { getRoleToUserId } from '../../utils/getRoleToUserId.js';

const deleteBusiness = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.userId;

        // Find business
        const business = await db.Business.findOne({
            where: {
                id

            }
        });

        if (!business) {
            return RESPONSE.error(res, 1026, 404);
        }

        // Start transaction
        const transaction = await db.sequelize.transaction();

        try {

            const role_id = await db.Role.findOne({
                where: {
                    name: "business_owner"
                }
            }).then((item) => {
                return item.id
            })
            const role_to_user_id = await getRoleToUserId(business.user_id, role_id)

            await db.UserRole.destroy({
                where: {
                    id: role_to_user_id
                },
                transaction
            })

            // Delete user sessions
            await db.UserSession.destroy({
                where: { user_role_id: role_to_user_id },
                transaction
            });

            // Get all branches for this business
            const branches = await db.Branches.findAll({
                where: { business_id: business.id },
                transaction
            });

            const branchIds = branches.map(branch => branch.id);

            // Delete offer reports for this business's branches
            if (branchIds.length > 0) {
                // await db.OfferReport.destroy({
                //     where: { branch_id: branchIds },
                //     transaction
                // });

                // Delete offers for this business's branches
                await db.Offer.destroy({
                    where: { branch_id: branchIds },
                    transaction
                });
            }

            // Delete business (cascades to branches, images, etc.)
            await db.Business.destroy({
                where: { id: business.id },
                transaction
            });

            // Delete user
            await db.User.destroy({
                where: { id: business.user_id },
                transaction
            });

            // Clean up any remaining offer reports (fallback)
            // await db.OfferReport.destroy({
            //     where: {
            //         branch_id: branchIds
            //     },
            //     transaction
            // })

            await transaction.commit();

            return RESPONSE.success(res, 1009, {});
        } catch (transactionError) {
            console.log(transactionError, "first")
            await transaction.rollback();
            throw transactionError;
        }
    } catch (error) {
        console.error('Error deleting business:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { deleteBusiness }