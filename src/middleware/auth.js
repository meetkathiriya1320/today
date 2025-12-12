import db from '../models/index.js';
import { RESPONSE } from '../helper/response.js';
import { verifyToken } from '../helper/jwt.js';
import { getRoleToUserId } from '../utils/getRoleToUserId.js';

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return RESPONSE.error(res, 2010, 401);
        }

        try {
            const decoded = verifyToken(token);

            const role_id = await db.Role.findOne({
                where: {
                    name: decoded.role
                }
            }).then((item) => {
                return item.id
            })

            const role_to_user_id = await getRoleToUserId(decoded.userId, role_id)

            // Check if user session exists and is valid
            const userSession = await db.UserSession.findOne({
                where: { user_role_id: role_to_user_id, token: token }
            });

            if (!userSession) {
                return RESPONSE.error(res, 2009, 401);
            }

            req.user = decoded;
            next();
        } catch (err) {
            console.log(err)
            return RESPONSE.error(res, 2008, 403);
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { authenticateToken };