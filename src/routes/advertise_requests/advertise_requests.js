import express from 'express';
import { controller } from '../../controllers/index.js';
import { uploadSingle, handleMulterError } from '../../helper/upload.js';
import { authenticateToken } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/adminAuth.js';
import { check_validation } from '../../helper/checkValidation.js';


const router = express.Router();

// Create advertise request
router.post('/', uploadSingle, handleMulterError, check_validation, authenticateToken, controller.createAdvertiseRequest);
router.post('/create', uploadSingle, handleMulterError, check_validation, authenticateToken, controller.createAdvertiseRequest_admin);
// Get all advertise requests
router.get('/', authenticateToken, controller.getAdvertiseRequests);

// Get banners (advertise + home banners) for current date
router.get('/banners', check_validation, controller.getBanners);

// Get all today's banners (all home banners + all approved advertise requests for today)
router.get('/all-todays-banners', authenticateToken, requireAdmin, controller.getAllTodaysBanners);

// Get advertise request by ID
router.get('/:id', check_validation, authenticateToken, controller.getAdvertiseRequestById);

// Update advertise banner status (admin only)
router.put('/:id/banner-status', authenticateToken, requireAdmin, controller.updateAdvertiseBannerStatus);

router.delete('/:id', authenticateToken, controller.deleteAdvertiseRequest);

export default router;