import { Request, Response } from "express";
import { AdminService } from "../services/admin.service";

export class AdminController {
  /**
   * GET stats for admin analytics.
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getStats();
      res.status(200).json({ stats });
    } catch (error) {
      console.error("Admin Get Stats Error:", error);
      res.status(500).json({ error: "Internal server error while fetching stats." });
    }
  }

  /**
   * GET /admin/users - Aggregated users list.
   */
  static async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";

      const data = await AdminService.listUsers(page, limit, search);
      res.status(200).json(data);
    } catch (error) {
      console.error("Admin List Users Error:", error);
      res.status(500).json({ error: "Internal server error while listing users." });
    }
  }

  /**
   * Block or unblock a user.
   */
  static async toggleUserBlock(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id as string;
      const result = await AdminService.toggleUserBlock(userId);
      res.status(200).json({ message: "User status toggled successfully.", data: result });
    } catch (error: any) {
      if (error.message === "INVALID_ID") {
        res.status(400).json({ error: "Invalid user ID format." });
        return;
      }
      if (error.message === "NOT_FOUND") {
        res.status(404).json({ error: "User not found." });
        return;
      }

      console.error("Admin Toggle User Block Error:", error);
      res.status(500).json({ error: "Internal server error during block toggle." });
    }
  }

  /**
   * GET /admin/recipes - List recipes with server-side pagination & filtering.
   */
  static async listRecipes(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const category = (req.query.category as string) || "all";
      const featured = (req.query.featured as string) || "all";

      const data = await AdminService.listRecipes(page, limit, search, category, featured);
      res.status(200).json(data);
    } catch (error) {
      console.error("Admin List Recipes Error:", error);
      res.status(500).json({ error: "Internal server error while retrieving recipes." });
    }
  }

  /**
   * Edit any recipe.
   */
  static async editRecipe(req: Request, res: Response): Promise<void> {
    try {
      const recipeId = req.params.id as string;
      const updatedRecipe = await AdminService.editRecipe(recipeId, req.body);
      res.status(200).json({ message: "Recipe updated successfully by admin.", recipe: updatedRecipe });
    } catch (error: any) {
      if (error.message === "INVALID_ID") {
        res.status(400).json({ error: "Invalid recipe ID format." });
        return;
      }
      if (error.message === "NOT_FOUND") {
        res.status(404).json({ error: "Recipe not found." });
        return;
      }

      console.error("Admin Edit Recipe Error:", error);
      res.status(500).json({ error: "Internal server error during recipe update." });
    }
  }

  /**
   * Delete any recipe.
   */
  static async deleteRecipe(req: Request, res: Response): Promise<void> {
    try {
      const recipeId = req.params.id as string;
      await AdminService.deleteRecipe(recipeId);
      res.status(200).json({ message: "Recipe deleted successfully by admin." });
    } catch (error: any) {
      if (error.message === "INVALID_ID") {
        res.status(400).json({ error: "Invalid recipe ID format." });
        return;
      }
      if (error.message === "NOT_FOUND") {
        res.status(404).json({ error: "Recipe not found." });
        return;
      }

      console.error("Admin Delete Recipe Error:", error);
      res.status(500).json({ error: "Internal server error during recipe deletion." });
    }
  }

  /**
   * Toggle isFeatured boolean on any recipe.
   */
  static async toggleFeaturedRecipe(req: Request, res: Response): Promise<void> {
    try {
      const recipeId = req.params.id as string;
      const result = await AdminService.toggleFeaturedRecipe(recipeId);
      res.status(200).json({ message: "Recipe featured status toggled successfully.", data: result });
    } catch (error: any) {
      if (error.message === "INVALID_ID") {
        res.status(400).json({ error: "Invalid recipe ID format." });
        return;
      }
      if (error.message === "NOT_FOUND") {
        res.status(404).json({ error: "Recipe not found." });
        return;
      }

      console.error("Admin Toggle Featured Recipe Error:", error);
      res.status(500).json({ error: "Internal server error during featured toggle." });
    }
  }

  /**
   * List all moderation reports.
   */
  static async listReports(req: Request, res: Response): Promise<void> {
    try {
      const reports = await AdminService.listReports();
      res.status(200).json({ reports });
    } catch (error) {
      console.error("Admin List Reports Error:", error);
      res.status(500).json({ error: "Internal server error during reports retrieval." });
    }
  }

  /**
   * Toggle report status.
   */
  static async toggleReportStatus(req: Request, res: Response): Promise<void> {
    try {
      const reportId = req.params.id as string;
      const result = await AdminService.toggleReportStatus(reportId);
      res.status(200).json({ message: "Report status toggled successfully.", data: result });
    } catch (error: any) {
      if (error.message === "INVALID_ID") {
        res.status(400).json({ error: "Invalid report ID format." });
        return;
      }
      if (error.message === "NOT_FOUND") {
        res.status(404).json({ error: "Report not found." });
        return;
      }

      console.error("Admin Toggle Report Status Error:", error);
      res.status(500).json({ error: "Internal server error during report status toggle." });
    }
  }

  /**
   * Delete reported recipe and resolve reports.
   */
  static async deleteReportedRecipe(req: Request, res: Response): Promise<void> {
    try {
      const reportId = req.params.id as string;
      await AdminService.deleteReportedRecipe(reportId);
      res.status(200).json({ message: "Offending recipe deleted and report resolved successfully." });
    } catch (error: any) {
      if (error.message === "INVALID_ID") {
        res.status(400).json({ error: "Invalid report ID format." });
        return;
      }
      if (error.message === "NOT_FOUND") {
        res.status(404).json({ error: "Report log not found." });
        return;
      }

      console.error("Admin Delete Reported Recipe Error:", error);
      res.status(500).json({ error: "Internal server error while resolving offending recipe." });
    }
  }

  /**
   * List all Stripe transaction payments.
   */
  static async listTransactions(req: Request, res: Response): Promise<void> {
    try {
      const transactions = await AdminService.listTransactions();
      res.status(200).json({ transactions });
    } catch (error) {
      console.error("Admin List Transactions Error:", error);
      res.status(500).json({ error: "Internal server error while retrieving transactions." });
    }
  }
}
