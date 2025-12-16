import db from '../../models/index.js';
const { Op } = db.Sequelize;
import { RESPONSE } from '../../helper/response.js';
import { appendBaseUrlToOfferImages } from '../../helper/urlHelper.js';

// Get All Offers with filtering and search
const getOffers = async (req, res) => {
    try {

        const { status, category_id, business_id, branch_id, start_date, end_date, search, limit = 10, page = 1, location, city, is_active } = req.query;

        const getRole = await db.Role.findOne({
            where: {
                name: 'business_owner'
            },
            raw: true
        });

        const role_id = getRole.id

        const offset = (page - 1) * limit;

        const whereClause = {}

        if (business_id) {
            const business = await db.Business.findOne({
                where: { id: business_id },

            });

            const user_id = business.user_id;
            if (user_id) whereClause.user_id = user_id;

        }

        if (status) whereClause.status = status;
        if (category_id) whereClause.category_id = category_id;
        if (branch_id) whereClause.branch_id = branch_id;
        if (is_active) whereClause.is_active = is_active



        // Handle location filtering through branch_id lookup
        if (location) {
            const branches = await db.Branches.findAll({
                where: {
                    location: { [Op.iLike]: `%${location}%` }
                },
                attributes: ['id'],
                raw: true
            });

            const branchIds = branches.map(branch => branch.id);
            if (branchIds.length > 0) {
                whereClause.branch_id = { [Op.in]: branchIds };
            } else {
                // If no branches found for the location, return empty result
                return RESPONSE.success(res, 1035, {
                    data: [],
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: 0,
                        totalItems: 0,
                        itemsPerPage: parseInt(limit)
                    },
                    location_filter: location
                });
            }
        }

        // Handle city filtering through branch_id lookup
        if (city) {
            const branches = await db.Branches.findAll({
                where: {
                    city: { [Op.iLike]: `%${city}%` }
                },
                attributes: ['id'],
                raw: true
            });

            const branchIds = branches.map(branch => branch.id);
            if (branchIds.length > 0) {
                whereClause.branch_id = { [Op.in]: branchIds };
            } else {
                // If no branches found for the city, return empty result
                return RESPONSE.success(res, 1035, {
                    data: [],
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: 0,
                        totalItems: 0,
                        itemsPerPage: parseInt(limit)
                    },
                    city_filter: city
                });
            }
        }

        // Search functionality across multiple fields
        if (search) {
            whereClause[Op.or] = [
                {
                    offer_title: {
                        [Op.iLike]: `%${search}%`  // Case-insensitive search
                    }
                },
                {
                    short_description: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                {
                    full_description: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                {
                    keywords: {
                        [Op.overlap]: [search]  // Search in keywords array
                    }
                }
            ];
        }

        //  Overlapping date condition
        if (start_date && end_date) {
            whereClause[Op.and] = [
                {
                    start_date: {
                        [Op.lte]: new Date(end_date)  // Offer starts before or on input end_date
                    }
                },
                {
                    [Op.or]: [
                        {
                            end_date: {
                                [Op.gte]: new Date(start_date)  // Offer ends after or on input start_date
                            }
                        },
                        {
                            end_date: null  // open-ended offer
                        }
                    ]
                }
            ];
        }

        const { count, rows } = await db.Offer.findAndCountAll({
            where: whereClause,
            include: [
                { model: db.Category, as: 'Category', attributes: ['id', 'name'] },
                {
                    model: db.Branches,
                    attributes: ['id', 'branch_name', 'latitude', 'longitude', 'location', 'city'],
                    include: [
                        {
                            model: db.Business,
                            as: 'Business',
                            attributes: ['id', 'business_name'],
                            include: [
                                {
                                    model: db.User,
                                    as: 'User',
                                    attributes: ['id', 'email'],
                                    include: [
                                        {
                                            model: db.UserRole,
                                            as: 'UserRoles',
                                            where: { role_id },
                                            required: false,
                                            attributes: ['first_name', 'last_name']
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                // {
                //     model: db.User,
                //     as: 'User',
                //     attributes: ['id', 'email'],
                //     include: [
                //         {
                //             model: db.UserRole,
                //             as: 'UserRoles',
                //             attributes: ['first_name', 'last_name']
                //         }
                //     ]
                // },
                { model: db.OfferImage, as: 'OfferImage', attributes: ['id', 'image'] },
                {
                    model: db.OfferRequestRejectDetails,
                    as: 'OfferRequestRejectDetails',
                    attributes: ['id', 'reason', 'created_at'],
                    required: false,
                    separate: true,
                    order: [['created_at', 'DESC']],
                    limit: 1
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);
        const updatedRows = rows.map(offer => {
            const obj = offer.toJSON();

            // Add first_name and last_name from UserRoles to User
            if (obj.User) {
                obj.User.first_name = obj.User.UserRoles?.[0]?.first_name || '';
                obj.User.last_name = obj.User.UserRoles?.[0]?.last_name || '';
            }

            // Convert OfferRequestRejectDetails (array) to single object or null
            if (obj.OfferRequestRejectDetails && obj.OfferRequestRejectDetails.length > 0) {
                obj.OfferRequestRejectDetails = obj.OfferRequestRejectDetails[0];
            } else {
                obj.OfferRequestRejectDetails = null;
            }

            return obj;
        });

        return RESPONSE.success(res, 1035, {
            data: updatedRows,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit)
            },
            location_filter: location || null,
            city_filter: city || null
        });

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};


export { getOffers };