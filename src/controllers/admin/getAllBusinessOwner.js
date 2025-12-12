import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import { Op } from 'sequelize';

const getAllBusinessOwner = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, is_verify, is_blocked } = req.query;
        const user_id = req.user.userId;

        const user = await db.User.findOne(
            {
                where: { id: user_id },

                raw: true
            }
        );

        if (!user || req.user.role !== 'admin') return RESPONSE.error(res, 5008, 400);

        const offset = (page - 1) * limit;

        // base include (no search inside include)
        const includeCondition = [
            {
                model: db.Business,
                attributes: ['id', 'business_name'],
                required: false,
                include: [
                    { model: db.Branches, as: 'branches', separate: true },
                    { model: db.BusinessImage, as: 'business_images', separate: true }
                ]
            }
        ];

        // Find business_owner role
        const businessOwnerRole = await db.Role.findOne({
            where: { name: 'business_owner' }
        });

        // If no search — just normal pagination of business owners
        if (!search) {

            const { count, rows } = await db.User.findAndCountAll({
                attributes: [
                    'id', 'email', 'phone_number'
                ],
                include: [
                    {
                        model: db.UserRole,
                        where: {
                            role_id: businessOwnerRole.id,
                            ...(is_blocked !== undefined && { is_blocked }),
                            ...(is_verify !== undefined && { is_verify })
                        },
                        attributes: ['is_verify', 'is_blocked', 'first_name', 'last_name']
                    },
                    ...includeCondition],
                offset,
                limit,
                distinct: true,
                subQuery: false
            });

            // Map rows to include fields from UserRole
            const businessOwners = rows.map(row => ({
                ...row.toJSON(),
                first_name: row.UserRoles?.[0]?.first_name || row.first_name,
                last_name: row.UserRoles?.[0]?.last_name || row.last_name,
                is_verify: row.UserRoles?.[0]?.is_verify || false,
                is_blocked: row.UserRoles?.[0]?.is_blocked || false
            }));

            return RESPONSE.success(res, 1025, {
                businessOwners,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            });
        }

        // ---- SEARCH FLOW: get matching user IDs from users OR businesses ----

        // 1) Users that match by first_name / last_name (from user_roles table)
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

        const userMatchIds = userRoleMatches.map(u => u.user_id);

        // 2) Businesses that match by business_name -> get their user_id
        const businessMatches = await db.Business.findAll({
            where: {
                business_name: { [Op.iLike]: `%${search}%` }
            },
            attributes: ['user_id'],
            raw: true
        });

        const businessMatchUserIds = businessMatches.map(b => b.user_id);

        // 3) Union unique ids
        const matchedIdsSet = new Set([...userMatchIds, ...businessMatchUserIds].filter(Boolean));
        const matchedIds = Array.from(matchedIdsSet);

        // If no matches, return empty paginated response
        if (matchedIds.length === 0) {
            return RESPONSE.success(res, 1025, {
                businessOwners: [],
                pagination: {
                    total: 0,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: 0
                }
            });
        }

        // 4) Now paginate over the matchedIds
        const { count, rows } = await db.User.findAndCountAll({
            where: {
                id: { [Op.in]: matchedIds }
            },
            attributes: [
                'id', 'email', 'phone_number'
            ],
            include: [
                {
                    model: db.UserRole,
                    where: {
                        role_id: businessOwnerRole.id,
                        ...(is_blocked !== undefined && { is_blocked }),
                        ...(is_verify !== undefined && { is_verify })
                    },
                    attributes: ['is_verify', 'is_blocked', 'first_name', 'last_name']
                },
                ...includeCondition
            ],
            offset,
            limit,
            distinct: true
        });

        // Map rows to include fields from UserRole
        const businessOwners = rows.map(row => ({
            ...row.toJSON(),
            first_name: row.UserRoles?.[0]?.first_name || row.first_name,
            last_name: row.UserRoles?.[0]?.last_name || row.last_name,
            is_verify: row.UserRoles?.[0]?.is_verify || false,
            is_blocked: row.UserRoles?.[0]?.is_blocked || false
        }));

        return RESPONSE.success(res, 1025, {
            businessOwners,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getAllBusinessOwner };
