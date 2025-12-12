import { RESPONSE } from "../../helper/response.js";
import db from "../../models/index.js";

const deleteAdvertiseRequest = async (req, res) => {
    try {

        const { id } = req.params;

        await db.AdvertiseRequest.destroy({ where: { id } });
        return RESPONSE.success(res, 5044)
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { deleteAdvertiseRequest }