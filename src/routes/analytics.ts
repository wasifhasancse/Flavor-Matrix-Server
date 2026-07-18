import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";
import { verifyToken } from "../middlewares/auth";

const router = Router();

// Protect all analytics endpoints with authentication
router.use(verifyToken as any);

router.get("/author", AnalyticsController.getAuthorAnalytics);

export const analyticsRouter = router;
