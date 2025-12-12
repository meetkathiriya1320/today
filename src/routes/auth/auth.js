import express from 'express';
import { controller } from '../../controllers/index.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();
// auth routes
router.post("/login", controller.login);
router.post("/register", controller.register);
router.post("/verify-otp", controller.verifyOtp);
router.post("/resend-otp", controller.resendOtp);
router.post("/change-password", authenticateToken, controller.changePassword);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.post("/logout", authenticateToken, controller.logout);

export default router;
