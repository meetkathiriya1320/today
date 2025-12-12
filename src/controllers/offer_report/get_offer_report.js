import { RESPONSE } from "../../helper/response.js";
import db from "../../models/index.js"

const get_offer_report = async (req, res) => {
    try {

        const { page, limit, search, business_name, branch_name } = req.query;

        if (!page || !limit) {
            RESPONSE.error(res, 5074, 400)
        }

        const offset = (page - 1) * limit

        // Build search condition with general search and specific filters
        let searchCondition = {};
        const conditions = [];

        // Add general search condition if provided
        if (search && search.trim()) {
            const searchTerm = search.trim();
            conditions.push({
                [db.Sequelize.Op.or]: [
                    {
                        '$Offer.offer_title$': {
                            [db.Sequelize.Op.iLike]: `%${searchTerm}%`
                        }
                    },
                    {
                        '$Offer.Branch.branch_name$': {
                            [db.Sequelize.Op.iLike]: `%${searchTerm}%`
                        }
                    },
                    {
                        '$Offer.Branch.Business.business_name$': {
                            [db.Sequelize.Op.iLike]: `%${searchTerm}%`
                        }
                    }
                ]
            });
        }

        // Add specific business_name filter if provided
        if (business_name && business_name.trim()) {
            const businessName = business_name.trim();
            conditions.push({
                '$Offer.Branch.Business.business_name$': {
                    [db.Sequelize.Op.iLike]: `%${businessName}%`
                }
            });
        }

        // Add specific branch_name filter if provided
        if (branch_name && branch_name.trim()) {
            const branchName = branch_name.trim();
            conditions.push({
                '$Offer.Branch.branch_name$': {
                    [db.Sequelize.Op.iLike]: `%${branchName}%`
                }
            });
        }

        // Combine all conditions with AND logic
        if (conditions.length > 0) {
            searchCondition = {
                [db.Sequelize.Op.and]: conditions
            };
        }

        const { count, rows } = await db.OfferReport.findAndCountAll({
            limit,
            offset,
            subQuery: false,
            where: searchCondition,
            include: [
                {
                    model: db.User,
                    attributes: ["email"],
                    include: [
                        {
                            model: db.Role,
                            attributes: ["id"],
                            where: {
                                name: "user"
                            },
                            through: {
                                attributes: ["first_name", "last_name"]
                            }
                        }
                    ]
                },
                {
                    model: db.Offer,
                    attributes: ["offer_title", "is_blocked", "blocked_reason"],
                    include: [
                        {
                            model: db.Branches,
                            attributes: ["branch_name"],
                            include: [
                                {
                                    model: db.Business,
                                    attributes: ["business_name"]
                                }
                            ]
                        }
                    ]
                }
            ]
        })

        const pagination = {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
        }

        const data = {
            data: rows,
            pagination
        }
        return RESPONSE.success(res, 5073, data)

    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 500, 500)
    }
}

export { get_offer_report }