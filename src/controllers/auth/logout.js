import db from '../../models/index.js';
import { RESPONSE } from '../../helper/response.js';

const logout = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return RESPONSE.error(res, 2006, 400);
        }

        // Delete the user session
        const deletedSession = await db.UserSession.destroy({
            where: { token: token }
        });

        if (deletedSession === 0) {
            return RESPONSE.error(res, 2007, 404);
        }

        return RESPONSE.success(res, 1003);

    } catch (error) {
        console.error('Logout error:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { logout };