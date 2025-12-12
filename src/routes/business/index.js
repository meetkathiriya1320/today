import express from 'express';
import { controller } from '../../controllers/index.js';
import { authenticateToken } from '../../middleware/auth.js';
import { upload } from '../../helper/upload.js';
import { check_validation } from '../../helper/checkValidation.js';
import { requireAdmin } from '../../middleware/adminAuth.js';

const router = express.Router();

router.post("/create-business", upload.any(), check_validation, controller.createBusiness)
router.post("/create-branch", check_validation, authenticateToken, controller.createBranch)
router.patch("/edit-business/:id", upload.any(), check_validation, authenticateToken, controller.editBusiness)
router.delete("/delete-business/:id", authenticateToken, requireAdmin, controller.deleteBusiness)
router.delete("/delete-branch/:id", authenticateToken, controller.deleteBranch)
router.delete("/delete-business-image/:id", authenticateToken, controller.deleteBusinessImage)
router.get("/get-business", authenticateToken, controller.getBusiness)
router.get("/get-branches", authenticateToken, controller.getBranches)
router.patch("/edit-branches/:id", authenticateToken, controller.editBranch)
router.patch("/verify-unverify-user/:id", authenticateToken, requireAdmin, controller.verifyUnverifyUser)
router.get("/city", controller.getUniqueCity)


export default router
