import { RESPONSE } from '../../helper/response.js';
import db from '../../models/index.js';
import fs from 'fs';
import path from 'path';

const deleteBusinessImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { business_id } = req.query

        // Find the image
        const image = await db.BusinessImage.findOne({
            where: { id },
            include: [
                {
                    model: db.Business,
                    where: { id: business_id },
                    required: true
                }
            ]
        });

        if (!image) {
            return RESPONSE.error(res, 5007, 404);
        }

        // Delete the file from disk
        const filePath = path.join(process.cwd(), 'public', image.image_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete the record
        await image.destroy();



        const updated_business_data = await db.Business.findOne({
            where: {
                id: business_id
            },
            include: [
                {
                    model: db.BusinessImage,
                    as: 'business_images'
                }
            ]
        })

        return RESPONSE.success(res, 5006, updated_business_data);
    } catch (error) {
        console.error('Error deleting business image:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { deleteBusinessImage }