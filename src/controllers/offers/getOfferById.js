import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
import { getImageUrl } from '../../helper/urlHelper.js';

// Helper function to append base URL to business images
const appendBaseUrl = (obj) => {
    if (obj && obj.Branches && obj.Branches.Business && obj.Branches.Business.business_images) {
        obj.Branches.Business.business_images = obj.Branches.Business.business_images.map(image => ({
            ...image,
            image_url: getImageUrl(image.image_url)
        }));
    }
    return obj;
};

// Get Offer by ID
const getOfferById = async (req, res) => {
    try {
        const { id } = req.params;

        const offer = await db.Offer.findByPk(id, {
            include: [
                {
                    model: db.Category,
                    as: 'Category',
                    attributes: ['id', 'name']
                },
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
                                    model: db.BusinessImage,
                                    as: 'business_images',
                                    attributes: ['id', 'image_url'],
                                    required: false
                                }
                            ]
                        }
                    ]
                },
                {
                    model: db.User,
                    as: 'User',
                    include: [
                        {
                            model: db.Role,
                            where: {
                                name: "business_owner"
                            },
                            through: {
                                attributes: ['first_name', 'last_name']
                            }
                        }
                    ],
                    attributes: ['id', 'email']
                },
                {
                    model: db.OfferImage,
                    as: 'OfferImage',
                    attributes: ['id', 'image']
                },
                {
                    model: db.OfferRequestRejectDetails,
                    as: 'OfferRequestRejectDetails',
                    attributes: ['id', 'reason', 'created_at'],
                    required: false,
                    separate: true,
                    order: [['created_at', 'DESC']],
                    limit: 1
                }
            ]
        });

        if (!offer) {
            return RESPONSE.error(res, 1039, 404); // Offer not found
        }

        // Check if offer is blocked
        if (offer.is_blocked) {
            return RESPONSE.error(res, 1077, 403); // Offer is blocked
        }

        // Apply base URL to images
        const offerJson = offer.toJSON();
        // Convert OfferRequestRejectDetails array to single object
        if (offerJson.OfferRequestRejectDetails && Array.isArray(offerJson.OfferRequestRejectDetails)) {
            offerJson.OfferRequestRejectDetails = offerJson.OfferRequestRejectDetails[0] || null;
        }
        const offerWithFullUrl = appendBaseUrl(offerJson);

        return RESPONSE.success(res, 1036, offerWithFullUrl);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getOfferById };