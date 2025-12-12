import express from 'express';
import { controller } from '../../controllers/index.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Get all settings or by key
router.get("/get", authenticateToken, controller.getReportOffer);

// Add new setting
router.post("/add", authenticateToken, controller.createReportOffer);

export default router
