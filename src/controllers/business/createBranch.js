import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

const createBranch = async (req, res) => {
    try {
        const { business_id, branch_name, phone_number, iso_code, country_code, latitude, longitude, contact_name, location, city } = req.body;

        // Check if branch already exists for this business with same name
        const existingBranch = await db.Branches.findOne({ where: { business_id, branch_name } });
        if (existingBranch) {
            return RESPONSE.error(res, 5002, 400); // Assuming 1023 is branch already exists
        }

        const branch = await db.Branches.create({
            business_id,
            branch_name,
            phone_number,
            country_code,
            iso_code,
            latitude,
            longitude,
            contact_name,
            location,
            city,
            status: "active"
        });

        return RESPONSE.success(res, 5001, branch);
    } catch (error) {
        console.error('Error creating branch:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { createBranch }