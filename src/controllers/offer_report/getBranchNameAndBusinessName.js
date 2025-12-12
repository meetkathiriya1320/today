import { RESPONSE } from "../../helper/response.js";
import db from "../../models/index.js";
import { Op } from "sequelize";

const getBranchNameAndBusinessName = async (req, res) => {
    try {
        const { type } = req.query;

        if (!type) {
            return RESPONSE.error(res, 400, "Type parameter is required (branch or business)");
        }

        // 1️⃣ Get all offer_ids used in OfferReport
        const offerReports = await db.OfferReport.findAll({
            attributes: ['offer_id'],
            where: { deleted_at: null },
            raw: true
        });

        const offerIds = offerReports.map(x => x.offer_id);

        if (offerIds.length === 0) {
            return RESPONSE.success(res, 200, []);
        }

        // 2️⃣ Get all branch_ids from Offer table
        const offers = await db.Offer.findAll({
            attributes: ['branch_id'],
            where: {
                id: { [Op.in]: offerIds },
                deleted_at: null
            },
            raw: true
        });

        const branchIds = [...new Set(offers.map(o => o.branch_id))];

        if (branchIds.length === 0) {
            return RESPONSE.success(res, 200, []);
        }

        // -------------------------------------------------------
        // 3️⃣ TYPE = BRANCH
        // -------------------------------------------------------
        if (type.toLowerCase() === 'branch') {

            const branches = await db.Branches.findAll({
                attributes: ['branch_name'],
                where: {
                    id: { [Op.in]: branchIds },
                    deleted_at: null
                },
                include: [
                    {
                        model: db.Business,
                        attributes: ['business_name'],
                        where: { deleted_at: null },
                        required: false
                    }
                ],
                order: [['branch_name', 'ASC']]
            });

            const result = branches.map(b => ({
                name: b.branch_name,
            }));
            const uniqueName = [...new Set(result.map(x => x.name))]

            return RESPONSE.success(res, 200, uniqueName);
        }

        // -------------------------------------------------------
        // 4️⃣ TYPE = BUSINESS
        // -------------------------------------------------------
        if (type.toLowerCase() === 'business') {

            const businesses = await db.Business.findAll({
                attributes: ['business_name'],
                where: { deleted_at: null },
                include: [
                    {
                        model: db.Branches,
                        as: 'branches',
                        attributes: ['id'],
                        where: {
                            id: { [Op.in]: branchIds },
                            deleted_at: null
                        },
                        required: true
                    }
                ]
                ,
                order: [['business_name', 'ASC']]
            });

            const result = businesses.map(b => ({
                id: b.id,
                name: b.business_name
            }));
            const uniqueName = [...new Set(result.map(x => x.name))]
            return RESPONSE.success(res, 200, uniqueName);
        }

        return RESPONSE.error(res, 1078);


    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 500, error.message);
    }
};

export { getBranchNameAndBusinessName };
