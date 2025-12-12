import Branches from '../../models/branches.model.js';
import Offers from '../../models/offers.model.js';
import { RESPONSE } from '../../helper/response.js';
import { Op } from 'sequelize';
import db from '../../models/index.js';

const nearByMeOffers = async (req, res) => {
    try {
        const { latitude, longitude, radius = 10 } = req.query; // radius in km

        if (!latitude || !longitude) {
            return RESPONSE.error(res, 5035, 400);
        }

        const userLat = parseFloat(latitude);
        const userLng = parseFloat(longitude);
        const initialRadius = parseFloat(radius);

        // Get all branches
        const branches = await Branches.findAll();

        // Try with increasing radii: initial, +5, +10
        const radiiToTry = [initialRadius, initialRadius + 5, initialRadius + 10];

        for (const radiusKm of radiiToTry) {
            // Filter branches within current radius
            const nearbyBranches = branches.filter(branch => {
                const distance = getDistance(userLat, userLng, branch.latitude, branch.longitude);
                return distance <= radiusKm;
            });


            if (nearbyBranches.length === 0) {
                continue; // Try next radius
            }

            const branchIds = nearbyBranches.map(branch => branch.id);
            console.log(branchIds)
            // Get offers from these businesses
            const offers = await Offers.findAll({
                where: {
                    branch_id: { [Op.in]: branchIds },
                    status: 'approved',
                    is_active: true,
                    end_date: {
                        [Op.gte]: new Date()
                    }
                },
                include: [
                    {
                        model: db.Branches,
                        as: 'Branch',
                        where: {
                            id: nearbyBranches.map(b => b.id)
                        },
                        required: true
                    },
                    {
                        model: db.OfferImage,
                        as: 'OfferImage'
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            if (offers.length > 0) {
                return RESPONSE.success(res, 5021, offers);
            }
        }

        // No offers found even with increased radii
        return RESPONSE.success(res, 5021, []);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
}

// Haversine formula to calculate distance between two points
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

export { nearByMeOffers }