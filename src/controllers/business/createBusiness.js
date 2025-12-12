import Business from '../../models/business.model.js';
import db from '../../models/index.js';
import { generateToken } from '../../helper/jwt.js';
import { RESPONSE } from '../../helper/response.js';
import { getRoleToUserId } from '../../utils/getRoleToUserId.js';

const createBusiness = async (req, res) => {
    const trans = await db.sequelize.transaction()
    try {
        const { business_name, user_id, phone_number, iso_code, country_code, branch_name, latitude, longitude, contact_name, location, city } = req.body;

        const images = req.files;

        // Check if business already exists for this user
        const existingBusiness = await Business.findOne({ where: { user_id }, transaction: trans });
        if (existingBusiness) {
            await trans.rollback();
            return RESPONSE.error(res, 1027, 400);
        }

        // Create new business
        const business_instance = await Business.create({
            business_name,
            user_id,
        },

            { transaction: trans },
        );

        const business_obj = business_instance.get({ plain: true });

        // Add branch

        const branches = await db.Branches.create({
            business_id: business_obj.id,
            phone_number,
            country_code,
            iso_code,
            branch_name,
            longitude,
            latitude,
            contact_name,
            location,
            city,
            status: "active"
        }, { transaction: trans });

        let business_images = []
        // Add images
        if (images && Array.isArray(images)) {
            for (const file of images) {
                const image_url = '/images/' + file.filename;
                business_images = await db.BusinessImage.create({
                    business_id: business_obj.id,
                    image_url
                }, { transaction: trans });
            }
        }

        const user_obj = await db.User.findOne({
            where: {
                id: user_id
            },
            include: [
                {
                    model: db.Role,
                    where: {
                        name: "business_owner"
                    },
                    through: {
                        attributes: ['first_name', 'last_name', 'is_verify']
                    }
                }
            ],

            transaction: trans
        })

        const user = user_obj.toJSON()



        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: "business_owner",
            businessId: business_obj.id
        });

        const role_id = await db.Role.findOne({
            where: {
                name: "business_owner"
            }
        }).then((item) => {
            return item.id
        })

        const role_to_user_id = await getRoleToUserId(user.id, role_id)

        // Create user session
        await db.UserSession.create({
            user_role_id: role_to_user_id,
            token: token,
            expire_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }, { transaction: trans });


        const data = {
            user: {
                ...user,
                role: "business_owner",
                first_name: user.Roles[0]?.UserRole?.first_name,
                last_name: user.Roles[0]?.UserRole?.last_name
            },
            token,
            business: {
                ...business_obj,

            }
        }

        await trans.commit()

        return RESPONSE.success(res, 1007, data)
    } catch (error) {
        await trans.rollback()
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { createBusiness }