import { Op, Sequelize } from "sequelize";
import { RESPONSE } from "../../helper/response.js";
import db from "../../models/index.js";

const dashboard = async (req, res) => {
    try {

        const user = req.user
        const is_admin = user.role === "admin"
        if (is_admin) {

            const total_business_owner = await db.UserRole.count({
                include: [{
                    model: db.Role,
                    where: { name: 'business_owner' },
                    required: true,

                }]
            });

            const total_users = await db.UserRole.count({
                include: [{
                    model: db.Role,
                    where: { name: 'user' },
                    attributes: [],

                }]
            });

            const active_business_owner = await db.UserRole.count({
                where: {
                    is_verify: true,
                    is_blocked: false
                },
                include: [{
                    model: db.Role,
                    where: { name: 'business_owner' },
                    attributes: [],

                }]
            })

            const in_active_business = await db.UserRole.count({
                where: {
                    [Op.or]: [
                        { is_verify: false },
                        { is_blocked: true }
                    ]
                },
                include: [{
                    model: db.Role,
                    where: { name: 'business_owner' },
                    attributes: [],

                }]
            })


            // Enhanced admin analytics
            const total_categories = await db.Category.count();
            const total_home_banners = await db.HomeBanner.count();
            const active_home_banners = await db.HomeBanner.count({ where: { is_active: true } });

            // Advertise management counts (using AdvertiseBanner for status info)
            const total_advertise_requests = await db.AdvertiseRequest.count();
            const total_advertise_banners = await db.AdvertiseBanner.count();
            const pending_advertise_requests = await db.AdvertiseBanner.count({ where: { status: 'pending' } });
            const approved_advertise_requests = await db.AdvertiseBanner.count({ where: { status: 'approved' } });
            const active_advertise_requests = await db.AdvertiseBanner.count({ where: { is_active: true } });

            // Offer management counts
            const total_offers = await db.Offer.count();
            const pending_offers = await db.Offer.count({ where: { status: 'pending' } });
            const approved_offers = await db.Offer.count({ where: { status: 'approved' } });
            const active_offers = await db.Offer.count({ where: { status: 'approved', is_active: true, is_blocked: false } });
            // Payment analytics
            const payment_total = await db.Payment.findOne({
                where: { status: "completed" },
                attributes: [[Sequelize.fn("SUM", Sequelize.col("amount")), "amount"]],
                raw: true
            });
            // User request management
            const unblock_requests = await db.UnblockUserRequest.count({ where: { status: 'pending' } });
            const totalBlockedUsers = await db.UserRole.count({ where: { is_blocked: true } });

            const data = {
                // User management
                "Total business owners": total_business_owner,
                "Active business owners": active_business_owner,
                "Total users": total_users,
                "Inactive business owners": in_active_business,

                // Content management
                "Total categories": total_categories,
                "Total home banners": total_home_banners,
                "Active home banners": active_home_banners,

                // Advertise management
                "Total advertise requests": total_advertise_requests,
                "Total advertise banners": total_advertise_banners,
                "Pending advertise requests": pending_advertise_requests,
                "Approved advertise requests": approved_advertise_requests,
                "Active advertise requests": active_advertise_requests,

                // Offer management
                "Total offers": total_offers,
                "Pending offers": pending_offers,
                "Approved offers": approved_offers,
                "Active offers": active_offers,

                // Financial
                "Total payment amount": payment_total.amount || 0,

                // Request management
                "Pending unblock requests": unblock_requests,
                "Total blocked users": totalBlockedUsers
            }
            return RESPONSE.success(res, 5039, data)
        }
        else {
            const userId = user.userId || user.id;

            const get_business = await db.Business.findOne({
                where: { user_id: userId },
                raw: true,
                attributes: ["id"]
            })

            if (!get_business) {
                return RESPONSE.error(res, 1073, 404);
            }

            // get branch id from business id
            const get_branch = await db.Branches.findAll({
                where: { business_id: get_business.id },
                raw: true,
                attributes: ["id"]
            })

            const branchIds = get_branch.map(b => b.id);

            if (!get_branch) {
                return RESPONSE.error(res, 1072, 404);
            }
            // Business-specific analytics
            const total_branches = await db.Branches.count({ where: { business_id: get_business.id } });

            // Business owner today promotion (active advertise banners starting today)
            const Active_promotion = await db.AdvertiseBanner.count({
                include: [{
                    model: db.AdvertiseRequest,
                    where: {
                        user_id: userId,
                    },
                    required: true
                }],
                where: {
                    is_active: true,
                    status: 'approved'
                }
            });
            const today = new Date();

            const business_offers = await db.Offer.findAll({
                where: {
                    branch_id: { [Op.in]: branchIds },
                    end_date: { [Op.gte]: today },
                    is_blocked: false  // Exclude blocked offers
                },
                raw: true
            });

            // Business owner Active Offers (approved and active)
            const active_offers = business_offers.filter(
                item => item.status === "approved" && item.is_active === true
            );
            // Business owner Deactivate Offers (approved but inactive)
            const deactivate_offers = business_offers.filter((item) => item.status === "approved" && item.is_active === false);
            const data = {
                // Business Owner Dashboard - Only the requested fields
                "business owner Active promotion": Active_promotion,
                "business owner Active Offers": active_offers.length,
                "business owner Deactivate Offers": deactivate_offers.length,
                "business owner Total Branch": total_branches
            }

            return RESPONSE.success(res, 5039, data)
        }
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { dashboard }