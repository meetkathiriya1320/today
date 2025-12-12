import { RESPONSE } from "../../helper/response.js";
import db from "../../models/index.js";

const verifyUnverifyUser = async (req, res) => {
    try {
        const { id } = req.params

        const { is_verify } = req.query

        const user = await db.User.findOne({
            where: {
                id
            },
            raw: true
        })

        if (user.is_verify) {
            return RESPONSE.error(res, 5041, 400);
        }


        await db.User.update({ is_verify, otp: null }, {
            where: {
                id
            }
        })

        const updated_user = await db.User.findOne({
            where: {
                id
            }
        })

        return RESPONSE.success(res, 5040, updated_user);

    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { verifyUnverifyUser }