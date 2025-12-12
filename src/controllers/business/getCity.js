import { RESPONSE } from "../../helper/response.js";
import db from "../../models/index.js";


const getUniqueCity = async (req, res) => {
    try {
        const uniqueCity = await db.Branches.findAll({
            attributes: [
                [db.Sequelize.fn('DISTINCT', db.Sequelize.col('city')), 'city']
            ]
        });
        // one array in all city and exclude null value and match unique uppercase and lowercase
        const cities =
            [...new Set(
                uniqueCity
                    .map(c => c.city?.toLowerCase())
                    .filter(c => c)
            )].sort();

        return RESPONSE.success(res, 1071, cities);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getUniqueCity };