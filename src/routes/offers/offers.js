import express from 'express';
import { controller } from '../../controllers/index.js';
import { uploadSingle, handleMulterError } from '../../helper/upload.js';
import { authenticateToken } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/adminAuth.js';
import { check_validation } from '../../helper/checkValidation.js';

const router = express.Router();

// Create offer
router.post('/', uploadSingle, handleMulterError, check_validation, authenticateToken, controller.createOffer);

// Get all offers
router.get('/', authenticateToken, controller.getOffers);

// get offers for users
router.get("/user-offers", controller.getOffersForUser)

// Get all user requests (offers) for the authenticated user
router.get('/my-requests', authenticateToken, controller.getUserOffers);

// Get offer by ID
router.get('/:id', check_validation, controller.getOfferById);

// Update offer
router.put('/:id', uploadSingle, handleMulterError, check_validation, authenticateToken, controller.updateOffer);

// Update offer status (admin only)
router.put('/:id/status', check_validation, authenticateToken, requireAdmin, controller.updateOfferStatus);

// Delete offer
router.delete('/:id', check_validation, authenticateToken, controller.deleteOffer);

// Toggle offer active status
router.patch('/toggle-active', authenticateToken, controller.toggleOfferActive);

// Block/Unblock offer
router.put('/block/:offer_id', authenticateToken, requireAdmin, controller.blockOffer);

router.post('/create', uploadSingle, handleMulterError, check_validation, authenticateToken, requireAdmin, controller.createOffer_admin);


export default router;