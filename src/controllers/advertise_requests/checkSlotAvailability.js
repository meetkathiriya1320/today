import db from '../../models/index.js';
const { Op } = db.Sequelize;

/**
 * Reusable function to check slot availability based on city, start date, and end date
 * Only 7 slots can run for the same city for overlapping date ranges
 * 
 * @param {string} city - City identifier for the advertisement
 * @param {Date} startDateUTC - Start date in UTC
 * @param {Date} endDateUTC - End date in UTC
 * @param {number} excludeRequestId - Optional request ID to exclude from count (for updates)
 * @returns {Object} - { available: boolean, currentSlotCount: number, availableIn?: string }
 */
export const checkSlotAvailability = async (city, startDateUTC, endDateUTC, excludeRequestId = null) => {
    try {
        // Build the base where clause for overlapping date ranges with city matching
        const whereClause = {
            city: { [Op.iLike]: `%${city}%` },  // Case-insensitive partial city match
            start_date: { [Op.lte]: startDateUTC },  // Existing slot starts before or when requested slot ends
            end_date: { [Op.gte]: endDateUTC }    // Existing slot ends after or when requested slot starts
        };
        // Add exclude clause if provided (for updates)
        if (excludeRequestId) {
            whereClause.id = { [Op.ne]: excludeRequestId };
        }

        // Count all overlapping slots that have:
        // 1. An advertise banner (approved/active status and is_active = true)
        // 2. A completed payment
        // 3. Exact same city
        const currentSlotCount = await db.AdvertiseRequest.count({
            where: whereClause,
            include: [
                {
                    model: db.AdvertiseBanner,
                    required: true,
                    where: {
                        status: { [Op.in]: ['approved', 'active'] }
                    },
                    include: [
                        {
                            model: db.Payment,
                            required: true,
                            where: { status: 'completed' }
                        }
                    ]
                }
            ]
        });
        const available = currentSlotCount < 7;
        return {
            available,
            currentSlotCount,
            maxSlots: 7,
            availableIn: available ? null : await calculateTimeUntilSlotAvailable(city, startDateUTC, endDateUTC, excludeRequestId)
        };
    } catch (error) {
        console.error('Error checking slot availability:', error);
        return {
            available: false,
            currentSlotCount: 0,
            maxSlots: 7,
            availableIn: '24 hours' // Default fallback
        };
    }
};

/**
 * Calculate time until a slot becomes available
 * @param {string} city 
 * @param {Date} startDateUTC 
 * @param {Date} endDateUTC 
 * @param {number} excludeRequestId 
 * @returns {string} - Human readable time string
 */
const calculateTimeUntilSlotAvailable = async (city, startDateUTC, endDateUTC, excludeRequestId = null) => {
    try {
        // Build where clause for overlapping slots with city matching
        const whereClause = {
            city: { [Op.iLike]: `%${city}%` },  // Case-insensitive partial city match
            start_date: { [Op.lte]: endDateUTC },
            end_date: { [Op.gte]: startDateUTC }
        };

        if (excludeRequestId) {
            whereClause.id = { [Op.ne]: excludeRequestId };
        }

        // Find all overlapping slots that have:
        // 1. An advertise banner (approved/active status and is_active = true)
        // 2. A completed payment
        // 3. Exact same city
        const overlappingSlots = await db.AdvertiseRequest.findAll({
            include: [
                {
                    model: db.AdvertiseBanner,
                    required: true,
                    where: {
                        status: { [Op.in]: ['approved', 'active'] },
                    },
                    include: [
                        {
                            model: db.Payment,
                            required: true,
                            where: { status: 'completed' }
                        }
                    ]
                }
            ],
            where: whereClause,
            order: [['end_date', 'ASC']]
        });

        if (overlappingSlots.length < 7) {
            return '0 minutes'; // Should be available now
        }

        // Get the 7th slot (index 6)
        const seventhSlot = overlappingSlots[6];

        if (seventhSlot) {
            const expiryDate = new Date(seventhSlot.end_date);
            const now = new Date();
            const timeDiff = expiryDate.getTime() - now.getTime();

            if (timeDiff <= 0) {
                return '0 minutes';
            }

            // Calculate time remaining in a human readable format
            const totalMinutes = Math.floor(timeDiff / (1000 * 60));
            const days = Math.floor(totalMinutes / (24 * 60));
            const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
            const minutes = totalMinutes % 60;

            if (days > 0) {
                return `${days} day${days > 1 ? 's' : ''} ${hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : ''}`.trim();
            } else if (hours > 0) {
                return `${hours} hour${hours > 1 ? 's' : ''} ${minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`.trim();
            } else {
                return `${minutes} minute${minutes > 1 ? 's' : ''}`;
            }
        }

        return '24 hours'; // Default fallback
    } catch (error) {
        console.error('Error calculating slot availability time:', error);
        return '24 hours';
    }
};