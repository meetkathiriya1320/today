import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

// Helper function to append base URL to image
const appendBaseUrl = (obj) => {
    if (obj.image) {
        obj.image = `${process.env.APP_PROJECT_PATH}${obj.image}`;
    }
    return obj;
};

// Get Advertise Request by ID
const getAdvertiseRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const advertiseRequest = await db.AdvertiseRequest.findByPk(id, {
            include: [
                {
                    model: db.User,
                    as: 'User',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: db.AdvertiseBanner,
                    as: 'AdvertiseBanner',
                    attributes: ['id', 'status', 'created_at', 'updated_at'],
                    include: [
                        {
                            model: db.Payment,
                            as: 'Payments',
                            attributes: ['id', 'payment_method', 'date', 'check_number', 'transaction_id', 'status', 'create_by', 'created_at']
                        }
                    ]
                }
            ]
        });

        if (!advertiseRequest) {
            return RESPONSE.error(res, 1030, 404); // Advertise request not found
        }

        const advertiseRequestWithFullUrl = advertiseRequest.toJSON();

        return RESPONSE.success(res, 1031, advertiseRequestWithFullUrl);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getAdvertiseRequestById };