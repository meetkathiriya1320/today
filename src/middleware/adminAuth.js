import db from '../models/index.js';
import { RESPONSE } from '../helper/response.js';

const requireAdmin = async (req, res, next) => {
    try {
        // First check if user is authenticated
        if (!req.user) {
            return RESPONSE.error(res, 2008, 401);
        }

        // Check if user role is admin
        if (req.user.role !== 'admin') {
            return RESPONSE.error(res, 1044, 403); // Access denied. Admin role required
        }

        next();
    } catch (error) {
        console.error('Admin authentication error:', error);
        return RESPONSE.error(res, 2999, 500, error);
    }
};

export { requireAdmin };