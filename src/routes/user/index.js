import express from 'express';
import { controller } from '../../controllers/index.js';
import { authenticateToken } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/adminAuth.js';

const router = express.Router();

router.get("/near-by-me-offers", controller.nearByMeOffers);
router.get("/profile", authenticateToken, controller.getProfile);
router.put("/edit-profile", authenticateToken, controller.editProfile);
router.delete("/delete-user", authenticateToken, requireAdmin, controller.deleteUser)

export default router