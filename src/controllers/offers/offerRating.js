import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

// Create Offer Rating (One user can only rate once)
const createOfferRating = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { offer_id, rating, review_text } = req.body;
        const user_id = req.user?.userId;

        // Validation
        if (!offer_id || !rating) {
            await transaction.rollback();
            return RESPONSE.error(res, 1054, 400); // Required fields missing
        }

        if (rating < 1 || rating > 5) {
            await transaction.rollback();
            return RESPONSE.error(res, 1055, 400); // Rating must be between 1-5
        }

        // Check if offer exists and is not blocked
        const offer = await db.Offer.findByPk(offer_id);
        if (!offer) {
            await transaction.rollback();
            return RESPONSE.error(res, 1039, 404); // Offer not found
        }

        if (offer.is_blocked) {
            await transaction.rollback();
            return RESPONSE.error(res, 1041, 403); // Cannot rate blocked offer
        }

        // Check if user has already rated this offer (excluding deleted ratings)
        const existingRating = await db.OfferRating.findOne({
            where: {
                offer_id,
                user_id,
                deleted_at: null  // Only check non-deleted ratings
            }
        });

        // If existingRating found (not null), user has already rated this offer (not deleted)
        if (existingRating) {
            await transaction.rollback();
            return RESPONSE.error(res, 1056, 409);
        }

        // Check if user had a deleted rating - if so, restore it instead of creating new
        const deletedRating = await db.OfferRating.findOne({
            where: {
                offer_id,
                user_id
            }
        });

        let ratingRecord;

        if (deletedRating && deletedRating.deleted_at) {
            // User had a deleted rating, restore it with new data
            await deletedRating.update({
                rating,
                review_text: review_text || null,
                deleted_at: null,  // Restore the record
                updated_by: user_id
            }, { transaction });

            ratingRecord = deletedRating;
        } else {
            // No existing rating found, create new one
            ratingRecord = await db.OfferRating.create({
                offer_id,
                user_id,
                rating,
                review_text: review_text || null,
                created_by: user_id,
                updated_by: null
            }, { transaction });
        }

        await transaction.commit();

        // Fetch rating with user information
        const ratingWithUser = await db.OfferRating.findByPk(ratingRecord.id, {
            include: [
                {
                    model: db.User,
                    as: 'ratingUser',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: db.Offer,
                    as: 'Offer',
                    attributes: ['id', 'offer_title']
                }
            ]
        });

        return RESPONSE.success(res, 1057, ratingWithUser, 201);
    } catch (error) {
        await transaction.rollback();
        // Handle unique constraint violation (race condition or duplicate attempt)
        if (error.name === 'SequelizeUniqueConstraintError' || error.code === '23505') {
            return RESPONSE.error(res, 1056, 409);
        }
        return RESPONSE.error(res, 2999, 500, error);
    }
};

// Get all ratings for an offer
const getOfferRatings = async (req, res) => {
    try {
        const { offer_id } = req.params;
        const { limit = 10, page = 1 } = req.query;

        const offset = (page - 1) * limit;

        // Validate offer exists and is not blocked
        const offer = await db.Offer.findByPk(offer_id);
        if (!offer) {
            return RESPONSE.error(res, 1039, 404); // Offer not found
        }

        if (offer.is_blocked) {
            return RESPONSE.error(res, 1042, 403); // Cannot view ratings for blocked offer
        }

        const { count, rows } = await db.OfferRating.findAndCountAll({
            where: { offer_id, deleted_at: null }, // Only get non-deleted ratings
            include: [
                {
                    model: db.User,
                    as: 'ratingUser',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);

        // Calculate average rating (only non-deleted)
        const averageRating = await db.OfferRating.findOne({
            where: { offer_id, deleted_at: null },
            attributes: [
                [db.sequelize.fn('AVG', db.sequelize.col('rating')), 'average_rating'],
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'total_ratings']
            ],
            raw: true
        });

        return RESPONSE.success(res, 1058, {
            ratings: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit)
            },
            summary: {
                average_rating: parseFloat(averageRating.average_rating || 0).toFixed(1),
                total_ratings: parseInt(averageRating.total_ratings || 0)
            }
        });

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

// Get rating by ID
const getRatingById = async (req, res) => {
    try {
        const { id } = req.params;

        const rating = await db.OfferRating.findByPk(id, {
            include: [
                {
                    model: db.User,
                    as: 'ratingUser',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: db.Offer,
                    as: 'Offer',
                    attributes: ['id', 'offer_title']
                },
                {
                    model: db.User,
                    as: 'creator',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: db.User,
                    as: 'updater',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                }
            ]
        });

        if (!rating || rating.deleted_at) {
            return RESPONSE.error(res, 1039, 404); // Rating not found or deleted
        }

        return RESPONSE.success(res, 1058, rating);

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

// Update rating
const updateOfferRating = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { id } = req.params;
        const { rating, review_text } = req.body;
        const user_id = req.user?.userId;

        // Validation
        if (!rating || rating < 1 || rating > 5) {
            await transaction.rollback();
            return RESPONSE.error(res, 1055, 400); // Invalid rating
        }

        const existingRating = await db.OfferRating.findByPk(id);

        if (!existingRating || existingRating.deleted_at) {
            await transaction.rollback();
            return RESPONSE.error(res, 1039, 404); // Rating not found or deleted
        }

        // Check if user owns this rating or is admin
        if (existingRating.user_id !== user_id && req.user?.role !== 'admin') {
            await transaction.rollback();
            return RESPONSE.error(res, 1053, 403); // Not authorized
        }

        const updatedRating = await existingRating.update({
            rating,
            review_text: review_text || null,
            updated_by: user_id
        }, { transaction });

        await transaction.commit();

        // Fetch updated rating with user information
        const ratingWithUser = await db.OfferRating.findByPk(updatedRating.id, {
            include: [
                {
                    model: db.User,
                    as: 'ratingUser',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: db.Offer,
                    as: 'Offer',
                    attributes: ['id', 'offer_title']
                }
            ]
        });

        return RESPONSE.success(res, 1060, ratingWithUser);

    } catch (error) {
        await transaction.rollback();
        // Handle unique constraint violation (race condition or duplicate attempt)
        if (error.name === 'SequelizeUniqueConstraintError' || error.code === '23505') {
            return RESPONSE.error(res, 1056, 409);
        }
        return RESPONSE.error(res, 2999, 500, error);
    }
};

// Delete rating (soft delete)
const deleteOfferRating = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { id } = req.params;
        const user_id = req.user?.userId;

        const existingRating = await db.OfferRating.findByPk(id);

        if (!existingRating || existingRating.deleted_at) {
            await transaction.rollback();
            return RESPONSE.error(res, 1039, 404); // Rating not found or already deleted
        }

        // Check if user owns this rating or is admin
        if (existingRating.user_id !== user_id && req.user?.role !== 'admin') {
            await transaction.rollback();
            return RESPONSE.error(res, 'Not authorized', 403); // Not authorized
        }

        // Soft delete by setting deleted_at
        await existingRating.update({
            deleted_at: new Date(),
            updated_by: user_id
        }, { transaction });

        await transaction.commit();

        return RESPONSE.success(res, 1061);

    } catch (error) {
        await transaction.rollback();
        // Handle unique constraint violation (race condition or duplicate attempt)
        if (error.name === 'SequelizeUniqueConstraintError' || error.code === '23505') {
            return RESPONSE.error(res, 1056, 409);
        }
        return RESPONSE.error(res, 2999, 500, error);
    }
};

// Get user's ratings
const getUserRatings = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { limit = 10, page = 1 } = req.query;

        const offset = (page - 1) * limit;

        const { count, rows } = await db.OfferRating.findAndCountAll({
            where: { user_id, deleted_at: null }, // Only get non-deleted ratings
            include: [
                {
                    model: db.Offer,
                    as: 'Offer',
                    attributes: ['id', 'offer_title', 'short_description']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);

        return RESPONSE.success(res, 1058, {
            ratings: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export {
    createOfferRating,
    getOfferRatings,
    getRatingById,
    updateOfferRating,
    deleteOfferRating,
    getUserRatings
};
