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
   * List aggregated moderation reports grouped by recipeId.
   */
  static async listAggregatedReports(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = (req.query.status as string) || "pending";

      const data = await AdminService.listAggregatedReports(page, limit, status);
      res.status(200).json(data);
    } catch (error) {
      console.error("Admin List Aggregated Reports Error:", error);
      res.status(500).json({ error: "Internal server error while retrieving reports." });
    }
  }

  /**
   * Get all individual report documents for a recipeId.
   */
  static async getReportDetails(req: Request, res: Response): Promise<void> {
    try {
      const recipeId = req.params.recipeId as string;
      const details = await AdminService.getReportDetailsByRecipe(recipeId);
      res.status(200).json({ details });
    } catch (error) {
      console.error("Admin Get Report Details Error:", error);
      res.status(500).json({ error: "Internal server error while fetching report details." });
    }
  }

  /**
   * Dismiss all reports linked to a recipeId.
   */
  static async dismissReports(req: Request, res: Response): Promise<void> {
    try {
      const recipeId = req.params.recipeId as string;
      const result = await AdminService.dismissReportsByRecipe(recipeId);
      res.status(200).json({ message: "Reports dismissed successfully.", data: result });
    } catch (error) {
      console.error("Admin Dismiss Reports Error:", error);
      res.status(500).json({ error: "Internal server error while dismissing reports." });
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

  // --- REVENUE & WITHDRAWALS ---

  static async getRevenueStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getRevenueStats();
      res.status(200).json({ success: true, stats });
    } catch (error) {
      console.error("Admin Revenue Stats Error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }

  static async createWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const { amount, note } = req.body;
      const adminEmail = (req as any).user?.email || "admin@system.com";
      const withdrawal = await AdminService.createWithdrawal(adminEmail, Number(amount), note);
      res.status(201).json({ success: true, withdrawal });
    } catch (error: any) {
      if (error.message === "INSUFFICIENT_FUNDS") {
        res.status(400).json({ error: "Insufficient available funds for withdrawal." });
        return;
      }
      if (error.message === "INVALID_AMOUNT") {
        res.status(400).json({ error: "Invalid amount." });
        return;
      }
      console.error("Admin Create Withdrawal Error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }

  static async listWithdrawals(req: Request, res: Response): Promise<void> {
    try {
      const withdrawals = await AdminService.listWithdrawals();
      res.status(200).json({ success: true, withdrawals });
    } catch (error) {
      console.error("Admin List Withdrawals Error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }

  // --- CATEGORIES ---

  static async listCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await AdminService.listCategories();
      res.status(200).json({ success: true, categories });
    } catch (error) {
      console.error("Admin List Categories Error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }

  static async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      if (!name) {
        res.status(400).json({ error: "Category name is required." });
        return;
      }
      const category = await AdminService.createCategory(name, description || "");
      res.status(201).json({ success: true, category });
    } catch (error: any) {
      if (error.message === "CATEGORY_EXISTS") {
        res.status(400).json({ error: "Category already exists." });
        return;
      }
      console.error("Admin Create Category Error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }

  static async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = req.params.id as string;
      await AdminService.deleteCategory(categoryId);
      res.status(200).json({ success: true, message: "Category deleted." });
    } catch (error: any) {
      if (error.message === "INVALID_ID") {
        res.status(400).json({ error: "Invalid ID format." });
        return;
      }
      if (error.message === "NOT_FOUND") {
        res.status(404).json({ error: "Category not found." });
        return;
      }
      console.error("Admin Delete Category Error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }

  // --- BROADCASTS ---

  static async listBroadcasts(req: Request, res: Response): Promise<void> {
    try {
      const broadcasts = await AdminService.listBroadcasts();
      res.status(200).json({ success: true, broadcasts });
    } catch (error) {
      console.error("Admin List Broadcasts Error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }

  static async createBroadcast(req: Request, res: Response): Promise<void> {
    try {
      const { subject, message } = req.body;
      const adminEmail = (req as any).user?.email || "admin@system.com";
      if (!subject || !message) {
        res.status(400).json({ error: "Subject and message are required." });
        return;
      }
      const broadcast = await AdminService.createBroadcast(adminEmail, subject, message);
      res.status(201).json({ success: true, broadcast });
    } catch (error: any) {
      console.error("Admin Create Broadcast Error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
}
