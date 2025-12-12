import db from '../../models/index.js';
const { Op } = db.Sequelize;
import { RESPONSE } from '../../helper/response.js';
import { Sequelize } from 'sequelize';

// Helper function to append base URL to image
const appendBaseUrl = (obj) => {
    if (obj.image) {
        obj.image = `${process.env.APP_PROJECT_PATH}${obj.image}`;
    }

    // Business images are already handled by the model getter that prepends APP_PROJECT_PATH
    // No additional processing needed for business images

    return obj;
};

// Get All Advertise Requests with filtering and pagination
const getAdvertiseRequests = async (req, res) => {
    try {
        const {
            status,
            search,
            start_date,
            end_date,
            location,
            city,
            branch_id,
            limit = 10,
            page = 1
        } = req.query;

        const offset = (page - 1) * limit;

        // find user or admin
        const is_admin = await req.user.role === "admin"

        const whereClause = {};

        const getRoleObject = await db.Role.findOne({
            where: { name: 'business_owner' },
            raw: true
        });

        const role_id = getRoleObject.id


        if (!is_admin) {
            whereClause.user_id = req.user.userId
        }
        const includeClause = [];

        // Filter by advertise banner status
        if (status) {
            includeClause.push({
                model: db.AdvertiseBanner,
                as: 'AdvertiseBanner',
                where: { status: status },
                required: true,
                attributes: ['id', 'status', 'created_at', 'updated_at', 'note'],
                include: [
                    {
                        model: db.Payment,
                        as: 'Payments',
                        attributes: ['id', 'payment_method', 'date', 'check_number', 'transaction_id', 'status', 'create_by', 'created_at']
                    }
                ]
            });
        } else {
            includeClause.push({
                model: db.AdvertiseBanner,
                as: 'AdvertiseBanner',
                attributes: ['id', 'status', 'created_at', 'updated_at', 'note'],
                include: [
                    {
                        model: db.Payment,
                        as: 'Payments',
                        attributes: ['id', 'payment_method', 'date', 'check_number', 'transaction_id', 'status', 'create_by', 'created_at']
                    }
                ]
            });
        }

        // Include User with Business details
        includeClause.push({
            model: db.User,
            as: 'User',
            attributes: ['id', 'email',
                [
                    Sequelize.literal(`(
            SELECT "first_name"
            FROM "user_roles"
            WHERE "user_roles"."user_id" = "User"."id"
              AND "user_roles"."role_id" = ${role_id}
            LIMIT 1
        )`),
                    "first_name"
                ],
                [
                    Sequelize.literal(`(
            SELECT "last_name"
            FROM "user_roles"
            WHERE "user_roles"."user_id" = "User"."id"
              AND "user_roles"."role_id" = ${role_id}
            LIMIT 1
        )`),
                    "last_name"
                ]
            ],
            required: false,
            include: [
                // {
                //     model: db.UserRole,
                //     as: "UserRoles",
                //     where: { role_id: role_id },
                //     attributes: [],
                //     required: false
                // },
                {
                    model: db.Business,
                    as: 'Business',
                    attributes: ['id', 'business_name'],
                    required: false,
                    include: [
                        {
                            model: db.BusinessImage,
                            as: 'business_images',
                            attributes: ['id', 'image_url'],
                            required: false
                        },
                        {
                            model: db.Branches,
                            as: 'branches',
                            attributes: ['id', 'branch_name', 'phone_number', 'latitude', 'longitude', 'contact_name', 'location', 'city', 'status'],
                            required: false
                        }
                    ]
                }
            ]
        });

        // Search functionality - comprehensive search across all relevant fields
        if (search) {
            // Build search conditions for AdvertiseRequest
            const searchConditions = [];

            // Search in AdvertiseRequest location
            searchConditions.push({
                location: {
                    [Op.iLike]: `%${search}%`
                }
            });
            
            // Search in AdvertiseRequest city
            searchConditions.push({
                city: {
                    [Op.iLike]: `%${search}%`
                }
            });

            // Search in AdvertiseRequest city
            searchConditions.push({
                city: {
                    [Op.iLike]: `%${search}%`
                }
            });

            // Search in user names from user_roles
            const matchingUserRoles = await db.UserRole.findAll({
                where: {
                    [Op.or]: [
                        { first_name: { [Op.iLike]: `%${search}%` } },
                        { last_name: { [Op.iLike]: `%${search}%` } }
                    ]
                },
                attributes: ['user_id'],
                raw: true
            });

            const userIds = matchingUserRoles.map(ur => ur.user_id);

            // Search in business names
            const matchingBusinesses = await db.Business.findAll({
                where: {
                    business_name: { [Op.iLike]: `%${search}%` }
                },
                attributes: ['user_id']
            });

            const businessUserIds = matchingBusinesses.map(business => business.user_id);

            // Search in branch names
            const matchingBranches = await db.Branches.findAll({
                where: {
                    branch_name: { [Op.iLike]: `%${search}%` }
                },
                attributes: ['business_id']
            });

            const branchBusinessIds = matchingBranches.map(branch => branch.business_id);
            const branchUsers = await db.Business.findAll({
                where: { id: { [Op.in]: branchBusinessIds } },
                attributes: ['user_id']
            });

            const branchUserIds = branchUsers.map(business => business.user_id);

            // Search in branch locations
            const matchingBranchLocations = await db.Branches.findAll({
                where: {
                    location: { [Op.iLike]: `%${search}%` }
                },
                attributes: ['business_id']
            });

            // Search in branch city
            const matchingBranchCity = await db.Branches.findAll({
                where: {
                    city: { [Op.iLike]: `%${search}%` }
                },
                attributes: ['business_id']
            });

            const locationBranchBusinessIds = matchingBranchLocations.map(branch => branch.business_id);
            const cityBranchBusinessIds = matchingBranchCity.map(branch => branch.business_id);
            const locationBranchUsers = await db.Business.findAll({
                where: { id: { [Op.in]: locationBranchBusinessIds } },
                attributes: ['user_id']
            });
            const cityBranchUsers = await db.Business.findAll({
                where: { id: { [Op.in]: cityBranchBusinessIds } },
                attributes: ['user_id']
            });

            const locationBranchUserIds = locationBranchUsers.map(business => business.user_id);
            const cityBranchUserIds = cityBranchUsers.map(business => business.user_id);

            // Combine all user IDs found from different searches
            const allUserIds = [
                ...userIds,
                ...businessUserIds,
                ...branchUserIds,
                ...locationBranchUserIds,
                ...cityBranchUserIds
            ];

            // Remove duplicates and add to search conditions
            const uniqueUserIds = [...new Set(allUserIds)];
            if (uniqueUserIds.length > 0) {
                searchConditions.push({
                    user_id: {
                        [Op.in]: uniqueUserIds
                    }
                });
            }

            // Apply the search conditions
            if (searchConditions.length > 0) {
                whereClause[Op.or] = searchConditions;
            }
        }

        // Filter by specific location (if not already searching and no user search)
        if (location && !search) {
            whereClause.location = {
                [Op.iLike]: `%${location}%`
            };
        }
        
        // Filter by specific city (if not already searching and no user search)
        if (city && !search) {
            whereClause.city = {
                [Op.iLike]: `%${city}%`
            };
        }

        // Filter by specific city (if not already searching and no user search)
        if (city && !search) {
            whereClause.city = {
                [Op.iLike]: `%${city}%`
            };
        }

        // Filter by specific branch
        if (branch_id) {
            // Find business IDs that have the specified branch
            const matchingBusinesses = await db.Branches.findAll({
                where: { id: branch_id },
                attributes: ['business_id']
            });

            const businessIds = matchingBusinesses.map(branch => branch.business_id);

            if (businessIds.length > 0) {
                // Find user IDs that own these businesses
                const matchingUsers = await db.Business.findAll({
                    where: { id: { [Op.in]: businessIds } },
                    attributes: ['user_id']
                });

                const userIds = matchingUsers.map(business => business.user_id);

                if (userIds.length > 0) {
                    whereClause.user_id = { [Op.in]: userIds };
                }
            }
        }

        // Date range filtering
        if (start_date && end_date) {
            whereClause[Op.and] = [
                {
                    start_date: {
                        [Op.lte]: new Date(end_date)
                    }
                },
                {
                    [Op.or]: [
                        {
                            end_date: {
                                [Op.gte]: new Date(start_date)
                            }
                        },
                        {
                            end_date: null
                        }
                    ]
                }
            ];
        }

        // If only start_date is provided
        if (start_date && !end_date) {
            whereClause.start_date = {
                [Op.gte]: new Date(start_date)
            };
        }

        // If only end_date is provided
        if (end_date && !start_date) {
            whereClause.end_date = {
                [Op.lte]: new Date(end_date)
            };
        }
        // FIXED PAGINATION USING findAndCountAll
        const { count, rows } = await db.AdvertiseRequest.findAndCountAll({
            where: whereClause,
            include: includeClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true,  // IMPORTANT
            order: [['created_at', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);

        const finalData = rows

        return RESPONSE.success(res, 1031, {
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit)
            },
            data: finalData
        });

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getAdvertiseRequests };
