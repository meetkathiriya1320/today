import { RESPONSE } from "../../helper/response.js"
import db from "../../models/index.js"

const create_offer_report = async (req, res) => {

    try {
        const { note, offer_id } = req.body

        const user_id = req.user.userId
        await db.OfferReport.create({
            user_id,
            note,
            offer_id
        });

        return RESPONSE.success(res, 5072, null)

    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, 500)

    }
}

export { create_offer_report }