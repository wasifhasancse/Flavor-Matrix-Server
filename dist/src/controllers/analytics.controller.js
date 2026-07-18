"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("../services/analytics.service");
class AnalyticsController {
    /**
     * GET /api/analytics/author - Fetches author recipe performance metrics & trajectory data.
     */
    static async getAuthorAnalytics(req, res) {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: "Unauthorized. User session required." });
                return;
            }
            const analytics = await analytics_service_1.AnalyticsService.getAuthorAnalytics(user.id, user.email);
            res.status(200).json(analytics);
        }
        catch (error) {
            console.error("Get Author Analytics Error:", error);
            res.status(500).json({ error: "Internal server error while retrieving author analytics." });
        }
    }
}
exports.AnalyticsController = AnalyticsController;
