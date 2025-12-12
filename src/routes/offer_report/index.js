import express from 'express';
import { controller } from '../../controllers/index.js';
import { authenticateToken } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/adminAuth.js';
import { check_validation } from '../../helper/checkValidation.js';

const router = express.Router();


router.post('/create', authenticateToken, check_validation, controller.create_offer_report);
router.get('/get', authenticateToken, requireAdmin, controller.get_offer_report);
router.get('/dropdown', authenticateToken, controller.getBranchNameAndBusinessName);



export default router;
