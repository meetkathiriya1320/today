import express from 'express';
import { controller } from '../../controllers/index.js';
import { authenticateToken } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/adminAuth.js';
import { upload } from '../../helper/upload.js';

const router = express.Router();

// Assuming these are admin routes, but using authenticateToken for now
router.get("/get-all-business-owner", authenticateToken, requireAdmin, controller.getAllBusinessOwner);
router.put("/block-business-owner", authenticateToken, requireAdmin, controller.blockBusinessOwner);
router.post("/send-unblock-request", controller.sendUnblockRequest);
router.get("/get-blocked-business-owner-request-listing", authenticateToken, controller.getBlockedBusinessOwnerRequestListing);
router.put("/approve-decline-block-request", authenticateToken, requireAdmin, controller.approveDeclineBlockRequest);
router.get("/decline-request-listing", authenticateToken, controller.declineRequestListing);
router.post("/add-user-by-admin", upload.array("images"), authenticateToken, requireAdmin, controller.addBusinessByAdmin);
router.put("/update-user-password", authenticateToken, requireAdmin, controller.updateUserPasswordByAdmin);
router.post("/add-admin", authenticateToken, requireAdmin, controller.addAdmin);
router.put("/edit-admin", authenticateToken, requireAdmin, controller.editAdmin);
router.delete("/delete-admin", authenticateToken, requireAdmin, controller.deleteAdmin);
router.get("/payments", authenticateToken, requireAdmin, controller.getPayments);
router.get("/user", authenticateToken, requireAdmin, controller.getUser);
router.get("/admins", authenticateToken, requireAdmin, controller.getAllAdmins);

export default router