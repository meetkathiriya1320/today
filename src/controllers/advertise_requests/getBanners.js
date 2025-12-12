import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';
const { Op } = db.Sequelize;

// Helper function to append base URL to image
const appendBaseUrl = (obj) => {
    if (obj.image) {
        obj.image = `${process.env.APP_PROJECT_PATH}${obj.image}`;
    }
    return obj;
};

// Get Banners Controller
const getBanners = async (req, res) => {
    try {
        // Get current date in UTC
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Get location, city  from request body
        const { location, city } = req.query;

        // Step 1: Fetch approved banners from advertise_requests for current date
        const advertiseWhereCondition = {
            start_date: { [Op.lte]: new Date() },
            end_date: { [Op.gte]: todayStart }
        };

        // Add location filter if provided
        if (location) {
            advertiseWhereCondition.location = { [Op.iLike]: `%${location}%` };
        }

        // Add city filter if provided
        if (city) {
            advertiseWhereCondition.city = {
                [Op.iLike]: `%${city}%`
            };
        }


        const advertiseBanners = await db.AdvertiseRequest.findAll({
            where: advertiseWhereCondition,
            include: [
                {
                    model: db.AdvertiseBanner,
                    required: true,
                    where: { status: 'approved', is_active: true },
                    include: [
                        {
                            model: db.Payment,
                            required: true,
                            where: { status: 'completed' }
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']], // Order by creation date, newest first
            limit: 7 // We don't need more than 7
        });

        const advertiseBannerCount = advertiseBanners.length;

        // Step 2: If we have less than 7 banners from advertise_requests, fetch from home_banners
        let homeBanners = [];
        let finalBanners = [...advertiseBanners];

        if (advertiseBannerCount < 7) {
            const homeBannersNeeded = 7 - advertiseBannerCount;

            homeBanners = await db.HomeBanner.findAll({
                where: { is_active: true }, // No specific conditions for home_banners
                order: [['created_at', 'DESC']], // Order by creation date, newest first
                limit: homeBannersNeeded
            });

            // Append home banners to the final list
            finalBanners = [...finalBanners, ...homeBanners];
        }

        // Step 3: Format the response data
        const formattedBanners = finalBanners.map((banner) => {
            const bannerData = banner.toJSON();

            // Check if this is an advertise banner or home banner
            if (bannerData.AdvertiseBanner) {
                // This is from advertise_requests table
                return {
                    id: bannerData.id,
                    type: 'advertise',
                    image: bannerData.image,
                    redirect_url: bannerData.offer_url || bannerData.external_url || null,
                    location: bannerData.location,
                    city: bannerData.city,
                    latitude: bannerData.latitude,
                    longitude: bannerData.longitude,
                    start_date: bannerData.start_date,
                    end_date: bannerData.end_date,
                    created_at: bannerData.created_at
                };
            } else {
                // This is from home_banners table
                return {
                    id: bannerData.id, // Prefix with home_ to distinguish from advertise banners
                    type: 'home',
                    image: bannerData.image,
                    redirect_url: bannerData.redirect_url || null,
                    position: bannerData.position || null,
                    created_at: bannerData.created_at
                };
            }
        });



        // Step 4: Return response
        return RESPONSE.success(res, 1051, {
            banners: formattedBanners,
            total_count: formattedBanners.length,
            advertise_banners_count: advertiseBannerCount,
            home_banners_count: finalBanners.length - advertiseBannerCount,
            requested_slots: 7,
            location_filter: location || null,
            city_filter: city || null
        }, 200);

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

// Get All Today's Banners Controller (Only Approved Advertise Requests for today)
const getAllTodaysBanners = async (req, res) => {
    try {
        // Get current date in UTC
        const currentDate = new Date();
        const currentDateUTC = new Date(Date.UTC(
            currentDate.getUTCFullYear(),
            currentDate.getUTCMonth(),
            currentDate.getUTCDate(),
            0, 0, 0, 0
        ));

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Fetch approved advertise requests for current date
        const advertiseBanners = await db.AdvertiseRequest.findAndCountAll({
            where: {
                start_date: { [Op.lte]: currentDateUTC },
                end_date: { [Op.gte]: currentDateUTC }
            },
            include: [
                {
                    model: db.AdvertiseBanner,
                    required: true,
                    where: { status: 'approved' },
                    include: [
                        {
                            model: db.Payment,
                            required: true,
                            where: { status: 'completed' },
                        }
                    ]
                },
                {
                    model: db.User,
                    include: [
                        {
                            model: db.Business
                        }
                    ],
                }
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset,
        });



        // Return response
        return RESPONSE.success(res, 1051, {
            banners: advertiseBanners.rows,
            pagination: {
                page,
                limit,
                total: advertiseBanners.count,
                total_pages: Math.ceil(advertiseBanners.count / limit)
            }
        }, 200);

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { getBanners, getAllTodaysBanners };