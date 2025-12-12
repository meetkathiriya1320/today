import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import { Op } from 'sequelize';

const getUser = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, is_verify, is_blocked } = req.query;
        const offset = (page - 1) * limit;

        const userRole = await db.Role.findOne({ where: { name: 'user' } });

        // If no search — just normal pagination of users
        if (!search) {
            const { count, rows } = await db.User.findAndCountAll({
                attributes: ['id', 'email', 'phone_number', 'country_code'],
                include: [{
                    model: db.UserRole,
                    where: {
                        role_id: userRole.id,
                        ...(is_blocked !== undefined && { is_blocked }),
                        ...(is_verify !== undefined && { is_verify })
                    },
                    attributes: ['first_name', 'last_name', 'is_verify', 'is_blocked', 'id'],
                    include: [{
                        model: db.Role,
                        where: { name: 'user' },
                        attributes: []
                    }]
                }],
                offset,
                limit,
                subQuery: false
            });

            // Map rows to include fields from UserRole
            const users = rows.map(row => ({
                ...row.toJSON(),
                first_name: row.UserRoles?.[0]?.first_name || '',
                last_name: row.UserRoles?.[0]?.last_name || '',
                is_verify: row.UserRoles?.[0]?.is_verify || false,
                is_blocked: row.UserRoles?.[0]?.is_blocked || false
            }));

            return RESPONSE.success(res, 1064, {
                users,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            });
        }

        // ---- SEARCH FLOW: get matching user IDs from user_roles ----

        // 1) Users that match by first_name / last_name / email
        const userRoleMatches = await db.UserRole.findAll({
            where: {
                role_id: userRole.id,
                ...(is_blocked !== undefined && { is_blocked }),
                ...(is_verify !== undefined && { is_verify }),
                [Op.or]: [
                    { first_name: { [Op.iLike]: `%${search}%` } },
                    { last_name: { [Op.iLike]: `%${search}%` } }
                ]
            },
            attributes: ['user_id'],
            raw: true
        });

        const userRoleIds = userRoleMatches.map(u => u.user_id);

        // Also search in User table for email
        const userMatches = await db.User.findAll({
            where: {
                email: { [Op.iLike]: `%${search}%` },
                [Op.and]: [
                    db.sequelize.literal(`EXISTS (
                        SELECT 1 FROM user_roles ur
                        WHERE ur.user_id = "User".id
                        AND ur.role_id = ${userRole.id}
                        ${is_blocked !== undefined ? `AND ur.is_blocked = ${is_blocked}` : ''}
                        ${is_verify !== undefined ? `AND ur.is_verify = ${is_verify}` : ''}
                    )`)
                ]
            },
            attributes: ['id'],
            raw: true
        });

        const userIds = userMatches.map(u => u.id);

        // Union unique ids
        const matchedIdsSet = new Set([...userRoleIds, ...userIds].filter(Boolean));
        const matchedIds = Array.from(matchedIdsSet);

        // If no matches, return empty paginated response
        if (matchedIds.length === 0) {
            return RESPONSE.success(res, 1064, {
                users: [],
                pagination: {
                    total: 0,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: 0
                }
            });
        }

        // Now paginate over the matchedIds
        const { count, rows } = await db.User.findAndCountAll({
            where: {
                id: { [Op.in]: matchedIds }
            },
            attributes: ['id', 'email', 'phone_number', 'country_code'],
            include: [{
                model: db.UserRole,
                where: {
                    role_id: userRole.id,
                    ...(is_blocked !== undefined && { is_blocked }),
                    ...(is_verify !== undefined && { is_verify })
                },
                attributes: ['first_name', 'last_name', 'is_verify', 'is_blocked'],
                include: [{
                    model: db.Role,
                    where: { name: 'user' },
                    attributes: []
                }]
            }],
            offset,
            limit,
            subQuery: false
        });

        // Map rows to include fields from UserRole
        const users = rows.map(row => ({
            ...row.toJSON(),
            first_name: row.UserRoles?.[0]?.first_name || '',
            last_name: row.UserRoles?.[0]?.last_name || '',
            is_verify: row.UserRoles?.[0]?.is_verify || false,
            is_blocked: row.UserRoles?.[0]?.is_blocked || false
        }));

        return RESPONSE.success(res, 1064, {
            users,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error); // Internal server error
    }
};

export { getUser };

