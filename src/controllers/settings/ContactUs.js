import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

const createContactUs = async (req, res) => {
    try {
        const { first_name, last_name, email, phone_number, note, country_code, iso_code } = req.body;

        if (!first_name || !last_name || !email, !phone_number, !note) {
            return RESPONSE.error(res, 1067, 400);
        }

        const newContactUs = await db.ContactUs.create({
            first_name,
            last_name,
            email,
            country_code,
            phone_number,
            note,
            iso_code
        });


        return RESPONSE.success(res, 1068, newContactUs);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 5000, 500);
    }
};

export { createContactUs };


