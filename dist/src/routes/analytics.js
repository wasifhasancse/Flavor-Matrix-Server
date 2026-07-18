"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Protect all analytics endpoints with authentication
router.use(auth_1.verifyToken);
router.get("/author", analytics_controller_1.AnalyticsController.getAuthorAnalytics);
exports.analyticsRouter = router;
