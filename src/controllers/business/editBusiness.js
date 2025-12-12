import Business from '../../models/business.model.js';
import { RESPONSE } from '../../helper/response.js';
import db from '../../models/index.js';

const editBusiness = async (req, res) => {
    const transaction = await db.sequelize.transaction()
    try {
        const { id } = req.params;
        const user_id = req.user.userId;
        const { business_name, branches_data, first_name, last_name } = req.body;
        const images = req.files;

        const get_business_data = await db.Business.findOne({
            where: {
                id
            },
            raw: true
        })

        // updat user deatils
        const business_user = get_business_data.user_id
        await db.User.update({
            ...(first_name && { first_name }),
            ...(last_name && { last_name })
        }, {
            where: {
                id: business_user
            },
            transaction
        })

        // update business data

        const updateData = { business_name };

        // Find and update business
        await Business.update(updateData, {
            where: {
                id,
                user_id
            },
            transaction
        });


        // Handle branches_data
        if (branches_data) {
            let branches = branches_data;
            if (typeof branches_data === 'string') {
                branches = JSON.parse(branches_data);
            }
            if (Array.isArray(branches)) {
                // Add new branches
                await Promise.all(
                    branches.map(async (branch) => {
                        if (branch.id) {
                            // 🔄 UPDATE existing branch
                            const { id, ...updateData } = branch;

                            return db.Branches.update(updateData, {
                                where: { id },
                                transaction
                            });
                        } else {
                            // 🆕 CREATE new branch
                            const branch_obj = { ...branch, business_id: id, status: "active" }
                            return db.Branches.create(branch_obj, { transaction });
                        }
                    })
                );
            }
        }

        // Add images if provided
        if (images && Array.isArray(images)) {
            for (const file of images) {
                const image_url = '/images/' + file.filename;
                await db.BusinessImage.create({
                    business_id: id,
                    image_url
                }, transaction);
            }
        }

        const updated_business_data = await db.Business.findOne({
            where: {
                id
            },
            include: [
                {
                    model: db.BusinessImage,
                    as: 'business_images'
                }
            ]
        })

        await transaction.commit()
        return RESPONSE.success(res, 1008, updated_business_data);
    } catch (error) {
        await transaction.rollback()
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { editBusiness }