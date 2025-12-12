import { RESPONSE } from "../../helper/response.js";
import db from "../../models/index.js"

const editBranch = async (req, res) => {

    try {
        const { id } = req.params
        const data = req.body

        const existingBranch = await db.Branches.findOne({ where: { id } });
        if (!existingBranch) {
            return RESPONSE.error(res, 5034);
        }

        await db.Branches.update(
            data,
            {
                where: {
                    id
                }
            }
        )

        const updatedBranch = await db.Branches.findOne({ where: { id } });
        return RESPONSE.success(res, 5022, updatedBranch)
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { editBranch }