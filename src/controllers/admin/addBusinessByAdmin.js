import { RESPONSE } from '../../helper/response.js';
import sendNotificationFromAdmin from '../../helper/sendNotificationFromAdmin.js';
import db from '../../models/index.js';

const addBusinessByAdmin = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const {
            email,
            password,
            first_name,
            last_name,
            business_name,
            branches_data
        } = req.body;
        const images = req.files;

        // Validate required fields
        if (!email || !password || !business_name) {
            return RESPONSE.error(res, 1041, 400);
        }

        // Find business_owner role
        const businessOwnerRole = await db.Role.findOne({
            where: { name: 'business_owner' },
            transaction
        });
        if (!businessOwnerRole) {
            await transaction.rollback();
            return RESPONSE.error(res, 2999, 500, 'Business owner role not found');
        }

        // Check if user already exists
        const existingUser = await db.User.findOne({
            where: { email: email.toLowerCase() },
            transaction
        });


        let user;
        if (existingUser) {
            user = existingUser;

            const isExistingBusinessowner = await db.UserRole.findOne({
                where: {
                    user_id: existingUser.id,
                    role_id: businessOwnerRole.id
                }
            })

            if (isExistingBusinessowner) {
                return RESPONSE.error(res, 5070, 409);
            }
        } else {
            // Create user
            user = await db.User.create({
                email: email.toLowerCase()
            }, { transaction });
        }

        // Create user role
        await db.UserRole.create({
            user_id: user.id,
            role_id: businessOwnerRole.id,
            first_name: first_name,
            last_name: last_name,
            password: password,
            is_verify: true,
            is_blocked: false
        }, { transaction });

        // Create business
        const business = await db.Business.create({
            business_name,
            user_id: user.id
        }, { transaction });


        let newBranch = []

        // Handle branches_data
        if (branches_data) {
            let branches = branches_data;
            if (typeof branches_data === 'string') {
                branches = JSON.parse(branches_data);
            }
            if (Array.isArray(branches)) {
                // Add new branches
                newBranch = await Promise.all(
                    branches.map(async (branch) => {
                        // 🆕 CREATE new branch
                        const branch_obj = { ...branch, business_id: business.id, status: "active" }
                        const new_branch_obj = db.Branches.create(branch_obj, { transaction });
                        return new_branch_obj
                    })
                );
            }
        }

        // Create business images
        let business_images = [];
        if (images && Array.isArray(images)) {
            for (const file of images) {
                const image_url = '/images/' + file.filename;
                const image = await db.BusinessImage.create({
                    business_id: business.id,
                    image_url
                }, { transaction });
                business_images.push(image);
            }
        }
        const notify_data = {
            id: req.user?.userId,
            message: `Your ${business_name} has been successfully onboarded by the admin.`,
            business_id: user.id,
            role_id: businessOwnerRole.id
        }

        await sendNotificationFromAdmin({
            data: notify_data,
            transaction
        });

        await transaction.commit();

        const responseData = {
            user: {
                id: user.id,
                email: user.email,
                first_name: first_name,
                last_name: last_name,
                phone_number: user.phone_number,
                country_code: user.country_code,
                is_verify: true
            },
            business: {
                ...business.toJSON(),
                branches: newBranch,
                business_images
            }
        };

        return RESPONSE.success(res, 1007, responseData);
    } catch (error) {
        await transaction.rollback();
        return RESPONSE.error(res, 2999, 500, error);
    }
}

export { addBusinessByAdmin };
