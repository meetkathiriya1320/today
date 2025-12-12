import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import { Op } from 'sequelize';

const getPayments = async (req, res) => {
    try {
        const { status, search, payment_method, start_date, end_date, limit = 10, page = 1 } = req.query;

        const offset = (page - 1) * limit;

        // Find business_owner role
        const businessOwnerRole = await db.Role.findOne({
            where: { name: 'business_owner' }
        });

        if (!businessOwnerRole) {
            return RESPONSE.error(res, 5016, 400); // Role not found
        }

        let totalCount;
        let payments;

        if (!search) {
            const whereClause = {};

            if (status) whereClause.status = status;
            if (payment_method) whereClause.payment_method = payment_method;

            // Date range filtering
            if (start_date && end_date) {
                whereClause.date = {
                    [Op.between]: [new Date(start_date), new Date(end_date)]
                };
            } else if (start_date) {
                whereClause.date = {
                    [Op.gte]: new Date(start_date)
                };
            } else if (end_date) {
                whereClause.date = {
                    [Op.lte]: new Date(end_date)
                };
            }

            const result = await db.Payment.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: db.AdvertiseBanner,
                        attributes: ["id", "status"],
                        include: [
                            {
                                model: db.AdvertiseRequest,
                                attributes: ["id", "location"],
                                include: [
                                    {
                                        model: db.User,
                                        as: 'User',
                                        attributes: ['id', 'email'],
                                        include: [
                                            {
                                                model: db.Business,
                                                attributes: ['business_name']
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['created_at', 'DESC']]
            });

            totalCount = result.count;
            payments = result.rows;
        } else {
            // Search by business_name
            const matchingBusinesses = await db.Business.findAll({
                where: {
                    business_name: { [Op.iLike]: `%${search}%` }
                },
                attributes: ['user_id'],
                raw: true
            });

            const businessUserIds = matchingBusinesses.map(b => b.user_id);

            if (businessUserIds.length === 0) {
                return RESPONSE.success(res, 1000, {
                    data: [],
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: 0,
                        totalItems: 0,
                        itemsPerPage: parseInt(limit)
                    }
                });
            }

            const whereClause = {
                '$AdvertiseBanner.AdvertiseRequest.user_id$': { [Op.in]: businessUserIds }
            };

            if (status) whereClause.status = status;
            if (payment_method) whereClause.payment_method = payment_method;

            // Date range filtering
            if (start_date && end_date) {
                whereClause.date = {
                    [Op.between]: [new Date(start_date), new Date(end_date)]
                };
            } else if (start_date) {
                whereClause.date = {
                    [Op.gte]: new Date(start_date)
                };
            } else if (end_date) {
                whereClause.date = {
                    [Op.lte]: new Date(end_date)
                };
            }

            const result = await db.Payment.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: db.AdvertiseBanner,
                        attributes: ["id", "status"],
                        include: [
                            {
                                model: db.AdvertiseRequest,
                                attributes: ["id", "location"],
                                include: [
                                    {
                                        model: db.User,
                                        as: 'User',
                                        attributes: ['id', 'email'],
                                        include: [
                                            {
                                                model: db.Business,
                                                attributes: ['business_name']
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['created_at', 'DESC']]
            });

            totalCount = result.count;
            payments = result.rows;
        }

        const totalPages = Math.ceil(totalCount / limit);

        return RESPONSE.success(res, 1000, {
            data: payments,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: totalCount,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getPayments };