import express from 'express';
import { controller } from '../../controllers/index.js';
import { authenticateToken } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/adminAuth.js';

const router = express.Router();

// Get all settings or by key
router.get("/", controller.getSettings);

// Add new setting
router.post("/", authenticateToken, controller.addSetting);

// Edit setting by id
router.put("/:id", authenticateToken, controller.editSetting);

// Delete setting by id
router.delete("/:id", authenticateToken, controller.deleteSetting);

// create Contact us
router.post("/contact", controller.createContactUs);

// get Contact us
router.get("/contact", authenticateToken, requireAdmin, controller.getContactUs);

export default router
