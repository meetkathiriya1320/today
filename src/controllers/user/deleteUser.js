import { RESPONSE } from "../../helper/response.js";
import db from "../../models/index.js";

const deleteUser = async (req, res) => {

    try {
        const { id } = req.query;

        await db.UserRole.destroy({
            where: {
                id
            }
        })

        return RESPONSE.success(res, 5071, null)
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }

}
export { deleteUser }