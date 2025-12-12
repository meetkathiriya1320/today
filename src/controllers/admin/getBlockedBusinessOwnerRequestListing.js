import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import { Op } from 'sequelize';

const getBlockedBusinessOwnerRequestListing = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, start_date, end_date, search } = req.query;

        const offset = (page - 1) * limit;

        const businessOwnerRole = await db.Role.findOne({ where: { name: 'business_owner' } });

        let whereCondition = {};
        if (status) {
            whereCondition.status = status;

        }

        if (start_date && end_date) {
            let startDate = new Date(start_date);
            startDate.setHours(0, 0, 0, 0);

            let endDate = new Date(end_date);
            endDate.setHours(23, 59, 59, 999);

            whereCondition.created_at = {
                [Op.between]: [startDate, endDate]
            };
        } else if (start_date) {
            let startDate = new Date(start_date);
            startDate.setHours(0, 0, 0, 0);

            whereCondition.created_at = {
                [Op.gte]: startDate
            };
        } else if (end_date) {
            let endDate = new Date(end_date);
            endDate.setHours(23, 59, 59, 999);

            whereCondition.created_at = {
                [Op.lte]: endDate
            };
        }

        let userIds = [];
        if (search) {
            // First, search users for matching first_name, last_name from user_roles, and email from users
            const userRoleMatches = await db.UserRole.findAll({
                where: {
                    role_id: businessOwnerRole.id,
                    [Op.or]: [
                        { first_name: { [Op.iLike]: `%${search}%` } },
                        { last_name: { [Op.iLike]: `%${search}%` } }
                    ]
                },
                attributes: ['user_id'],
                raw: true
            });

            const userRoleIds = userRoleMatches.map(u => u.user_id);

            const userMatches = await db.User.findAll({
                where: {
                    email: { [Op.iLike]: `%${search}%` },
                    [Op.and]: [
                        db.sequelize.literal(`EXISTS (
                            SELECT 1 FROM user_roles ur
                            WHERE ur.user_id = "User".id
                            AND ur.role_id = ${businessOwnerRole.id}
                        )`)
                    ]
                },
                attributes: ['id'],
                raw: true
            });

            userIds = [...userRoleIds, ...userMatches.map(u => u.id)];

            // Now, add to whereCondition for UnblockUserRequest
            whereCondition[Op.or] = whereCondition[Op.or] || [];
            if (userIds.length > 0) {
                whereCondition[Op.or].push({ user_id: { [Op.in]: userIds } });
            }
            whereCondition[Op.or].push(
                { decline_reason: { [Op.iLike]: `%${search}%` } },
                { note: { [Op.iLike]: `%${search}%` } }
            );
        }

        const { count, rows } = await db.UnblockUserRequest.findAndCountAll({
            where: whereCondition,
            offset: offset,
            limit: limit,
            include: [
                {
                    model: db.User,
                    include: [{
                        model: db.UserRole,
                        where: { role_id: businessOwnerRole.id },
                        attributes: ['first_name', 'last_name'],
                        include: [{
                            model: db.Role,
                            where: { name: 'business_owner' },
                            attributes: []
                        }]
                    }],
                    attributes: ["email"]
                }
            ]
        });

        const responseData = {
            requests: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        };


        return RESPONSE.success(res, 1025, responseData);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { getBlockedBusinessOwnerRequestListing }