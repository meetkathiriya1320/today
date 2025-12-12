import db from "../../models/index.js";
import { RESPONSE } from "../../helper/response.js";
import { Op } from 'sequelize';

const getAllAdmins = async (req, res) => {
    try {
        const { search } = req.query;
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Find the admin role
        const adminRole = await db.Role.findOne({
            where: { name: 'admin' }
        });

        if (!adminRole) {
            return RESPONSE.error(res, 5056, 400); // Role not found
        }

        let totalCount;
        let admins;

        if (!search) {
            // Get total count of admin users
            totalCount = await db.User.count({
                include: [
                    {
                        model: db.Role,
                        through: { attributes: [] },
                        where: { id: adminRole.id },
                        attributes: []
                    }
                ]
            });

            // Get paginated admin users
            admins = await db.User.findAll({
                include: [
                    {
                        model: db.Role,
                        through: { attributes: ["first_name", "last_name"] },
                        where: { id: adminRole.id },
                        attributes: ['id', 'name']
                    }
                ],
                limit: limit,
                offset: offset,
                order: [['created_at', 'DESC']]
            });
        } else {
            // Search logic
            // 1) Users that match by first_name / last_name (from user_roles table)
            const userRoleMatches = await db.UserRole.findAll({
                where: {
                    role_id: adminRole.id,
                    [Op.or]: [
                        { first_name: { [Op.iLike]: `%${search}%` } },
                        { last_name: { [Op.iLike]: `%${search}%` } }
                    ]
                },
                attributes: ['user_id'],
                raw: true
            });

            const userMatchIds = userRoleMatches.map(u => u.user_id);

            // 2) Users that match by email
            const emailMatches = await db.User.findAll({
                where: {
                    email: { [Op.iLike]: `%${search}%` }
                },
                include: [
                    {
                        model: db.Role,
                        through: { attributes: [] },
                        where: { id: adminRole.id },
                        attributes: []
                    }
                ],
                attributes: ['id'],
                raw: true
            });

            const emailMatchIds = emailMatches.map(u => u.id);

            // Union unique ids
            const matchedIdsSet = new Set([...userMatchIds, ...emailMatchIds].filter(Boolean));
            const matchedIds = Array.from(matchedIdsSet);

            totalCount = matchedIds.length;

            if (matchedIds.length === 0) {
                return RESPONSE.success(res, 1000, {
                    admins: [],
                    pagination: {
                        current_page: page,
                        per_page: limit,
                        total_count: 0,
                        total_pages: 0,
                        has_next: false,
                        has_prev: false
                    }
                });
            }

            // Get paginated admin users
            admins = await db.User.findAll({
                where: {
                    id: { [Op.in]: matchedIds }
                },
                include: [
                    {
                        model: db.Role,
                        through: { attributes: ["first_name", "last_name"] },
                        where: { id: adminRole.id },
                        attributes: ['id', 'name']
                    }
                ],
                limit: limit,
                offset: offset,
                order: [['created_at', 'DESC']]
            });
        }

        // Format the response data
        const adminData = admins.map(admin => {
            const plain = admin.toJSON();

            return {
                ...plain,
                first_name: plain.Roles?.[0]?.UserRole?.first_name || '',
                last_name: plain.Roles?.[0]?.UserRole?.last_name || '',
                roles: plain.Roles?.map(role => ({
                    id: role.id,
                    name: role.name
                })) || []
            };
        });

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        const pagination = {
            current_page: page,
            per_page: limit,
            total_count: totalCount,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
        };

        return RESPONSE.success(res, 1000, {
            admins: adminData,
            pagination: pagination
        });

    } catch (error) {
        console.error('Get all admins error:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { getAllAdmins }