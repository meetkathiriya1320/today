import express from 'express';
import authRoutes from "./auth/auth.js"
import categoryRoutes from "./categories/categories.js"
import businessRoute from "./business/index.js"
import homeBannerRoutes from "./home_banners/home_banners.js"
import adminRoutes from "./admin/index.js"
import advertiseRequestRoutes from "./advertise_requests/advertise_requests.js"
import settingsRoute from "./settings/index.js"
import userRoutes from "./user/index.js"
import OfferRoute from './offers/offers.js'
import reportOfferRoute from './report_offers/index.js'
import { authenticateToken } from '../middleware/auth.js';
import { controller } from '../controllers/index.js';
import notificationRoute from './notification/notification.js'
import offerReportRoute from './offer_report/index.js'
import { requireAdmin } from '../middleware/adminAuth.js';
import imageRoutes from "./images/images.js";



const router = express.Router();

router.use("/auth", authRoutes)
router.use("/categories", categoryRoutes)
router.use("/business", businessRoute)
router.use("/home-banners", homeBannerRoutes)
router.use("/admin", adminRoutes)
router.use("/advertise-requests", advertiseRequestRoutes)
router.use("/settings", settingsRoute)
router.use("/user", userRoutes)
router.use("/offers", OfferRoute)
router.use("/report-offers", reportOfferRoute)
router.get("/dashboard", authenticateToken, controller.dashboard)
router.use("/notification", notificationRoute)
router.use("/offer-report", offerReportRoute)
router.use("/images", imageRoutes)

export default router
