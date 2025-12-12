import express from 'express';
import { controller } from '../../controllers/index.js';
import { handleMulterError, uploadSingle } from '../../helper/upload.js';
import { requireAdmin } from '../../middleware/adminAuth.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Create home banner
router.get('/', authenticateToken, controller.getNotification);
router.get('/unread-count', authenticateToken, controller.getUnReadNotificationCount);
router.post('/create-by-admin', uploadSingle, handleMulterError, authenticateToken, requireAdmin, controller.createNotification);
router.patch('/read-notification', authenticateToken, controller.readNotification);


export default router;
