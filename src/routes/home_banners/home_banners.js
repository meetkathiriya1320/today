import express from 'express';
import { controller } from '../../controllers/index.js';
import { authenticateToken } from '../../middleware/auth.js';
import { uploadBannerImage, handleMulterError } from '../../helper/upload.js';

const router = express.Router();

// Create home banner
router.post('/', uploadBannerImage, handleMulterError, authenticateToken, controller.createHomeBanner);

// Get all home banners
router.get('/', controller.getHomeBanners);

// Get home banner by ID
router.get('/:id', controller.getHomeBannerById);

// Update home banner
router.put('/:id', uploadBannerImage, handleMulterError, authenticateToken, controller.updateHomeBanner);

// Delete home banner
router.delete('/:id', authenticateToken, controller.deleteHomeBanner);

export default router;