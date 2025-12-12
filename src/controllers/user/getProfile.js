import db from "../../models/index.js";
import { RESPONSE } from "../../helper/response.js";

const getProfile = async (req, res) => {

    try {
        const user_id = req.user.userId;

        const data = await db.User.findOne({
            where: {
                id: user_id
            }
        })
        return RESPONSE.success(res, 5033, data)
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }

}

export { getProfile };