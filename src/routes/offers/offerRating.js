import express from 'express';
import { controller } from '../../controllers/index.js';
import { authenticateToken } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/adminAuth.js';
import { check_validation } from '../../helper/checkValidation.js';

const router = express.Router();

// Create rating for an offer (one user can only rate once)
router.post('/', check_validation, authenticateToken, controller.createOfferRating);

// Get all ratings for an offer
router.get('/offer/:offer_id', controller.getOfferRatings);

// Get rating by ID
router.get('/:id', check_validation, authenticateToken, controller.getRatingById);

// Update rating
router.put('/:id', check_validation, authenticateToken, controller.updateOfferRating);

// Delete rating
router.delete('/:id', check_validation, authenticateToken, controller.deleteOfferRating);

// Get user's ratings
router.get('/user/:user_id', check_validation, authenticateToken, controller.getUserRatings);

export default router;