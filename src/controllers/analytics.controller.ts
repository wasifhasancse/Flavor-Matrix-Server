import { Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service";

export class AnalyticsController {
  /**
   * GET /api/analytics/author - Fetches author recipe performance metrics & trajectory data.
   */
  static async getAuthorAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: "Unauthorized. User session required." });
        return;
      }

      const analytics = await AnalyticsService.getAuthorAnalytics(user.id, user.email);
      res.status(200).json(analytics);
    } catch (error) {
      console.error("Get Author Analytics Error:", error);
      res.status(500).json({ error: "Internal server error while retrieving author analytics." });
    }
  }
}
