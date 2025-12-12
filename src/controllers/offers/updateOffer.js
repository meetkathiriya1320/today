import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper function to append base URL to image
const appendBaseUrl = (obj) => {
    if (obj && obj.OfferImage) {
        if (obj.OfferImage.image) {
            obj.OfferImage.image = `${process.env.APP_PROJECT_PATH}${obj.OfferImage.image}`;
        }
    }
    return obj;
};

// Helper function to delete old image file from filesystem
const deleteOldImageFile = (imagePath) => {
    try {
        if (!imagePath) return;

        // Remove /images/ prefix if present
        const fileName = imagePath.replace('/images/', '');
        const fullPath = path.join(process.cwd(), 'public', 'images', fileName);

        // Check if file exists and delete it
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`Deleted old image file: ${fullPath}`);
        }
    } catch (error) {
        console.error('Error deleting old image file:', error);
        // Don't throw error, just log it - file deletion shouldn't fail the operation
    }
};

// Helper function to get offer images before update
const getOfferImages = async (offerId, transaction) => {
    const existingImages = await db.OfferImage.findAll({
        where: { offer_id: offerId },
        transaction
    });
    return existingImages;
};

// Update Offer (only if status is pending)
const updateOffer = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { id } = req.params;
        const { category_id, branch_id, offer_title, short_description, full_description, start_date, end_date, keywords, is_active } = req.body;
        const is_admin = req.user.role == "admin"

        const getRole = await db.Role.findOne({
            where: {
                name: 'business_owner'
            },
            raw: true
        });

        const role_id = getRole.id

        const offer = await db.Offer.findByPk(id, { transaction });

        if (!offer) {
            await transaction.rollback();
            return RESPONSE.error(res, 1039, 404); // Offer not found
        }

        if (offer.status !== 'pending' && !is_admin) {
            await transaction.rollback();
            return RESPONSE.error(res, 1040, 400); // Offer can only be updated if status is pending
        }

        // Parse keywords from JSON string to array if it exists
        let parsedKeywords = undefined;
        if (keywords !== undefined) {
            try {
                parsedKeywords = typeof keywords === 'string' ? JSON.parse(keywords) : keywords;
            } catch (error) {
                // If parsing fails, try to convert string to array
                parsedKeywords = Array.isArray(keywords) ? keywords : [keywords];
            }
        }

        // Get existing images before updating
        const existingImages = await getOfferImages(offer.id, transaction);

        // Update offer
        await offer.update({
            ...(category_id && { category_id }),
            ...(branch_id && { branch_id }),
            ...(offer_title && { offer_title }),
            ...(short_description !== undefined && { short_description }),
            ...(full_description !== undefined && { full_description }),
            ...(start_date && { start_date }),
            ...(end_date !== undefined && { end_date }),
            ...(is_active !== undefined && { is_active }),
            ...(keywords !== undefined && { keywords: parsedKeywords }),
            updated_by: req.user.userId
        }, { transaction });

        // Handle new image upload - delete old images and add new one
        if (req.file) {
            // Delete old image records from database and file system
            for (const oldImage of existingImages) {
                // Delete old image file from filesystem
                deleteOldImageFile(oldImage.image);

                // Delete old image record from database
                await oldImage.destroy({ transaction });
            }

            // Create new image record
            const image = `/images/${req.file.filename}`;
            await db.OfferImage.create({
                offer_id: offer.id,
                image: image
            }, { transaction });
        }

        await transaction.commit();

        // Fetch updated offer with images
        const updatedOffer = await db.Offer.findByPk(offer.id, {
            include: [
                {
                    model: db.Category,
                    as: 'Category',
                    attributes: ['id', 'name']
                },
                {
                    model: db.Branches,
                    attributes: ['id', 'branch_name'],
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
                {
                    model: db.OfferImage,
                    as: 'OfferImage',
                    attributes: ['id', 'image']
                }
            ]
        });

        // Apply base URL to images
        const offerWithFullUrl = appendBaseUrl(updatedOffer.toJSON());

        return RESPONSE.success(res, 1037, offerWithFullUrl);
    } catch (error) {
        console.log(error, "updateOfferupdateOfferupdateOffer")
        await transaction.rollback();
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { updateOffer };