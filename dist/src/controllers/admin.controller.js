"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("../services/admin.service");
class AdminController {
    /**
     * GET stats for admin analytics.
     */
    static async getStats(req, res) {
        try {
            const stats = await admin_service_1.AdminService.getStats();
            res.status(200).json({ stats });
        }
        catch (error) {
            console.error("Admin Get Stats Error:", error);
            res.status(500).json({ error: "Internal server error while fetching stats." });
        }
    }
    /**
     * GET /admin/users - Aggregated users list.
     */
    static async listUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            const data = await admin_service_1.AdminService.listUsers(page, limit, search);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Admin List Users Error:", error);
            res.status(500).json({ error: "Internal server error while listing users." });
        }
    }
    /**
     * Block or unblock a user.
     */
    static async toggleUserBlock(req, res) {
        try {
            const userId = req.params.id;
            const result = await admin_service_1.AdminService.toggleUserBlock(userId);
            res.status(200).json({ message: "User status toggled successfully.", data: result });
        }
        catch (error) {
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
    static async listRecipes(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            const category = req.query.category || "all";
            const featured = req.query.featured || "all";
            const data = await admin_service_1.AdminService.listRecipes(page, limit, search, category, featured);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Admin List Recipes Error:", error);
            res.status(500).json({ error: "Internal server error while retrieving recipes." });
        }
    }
    /**
     * Edit any recipe.
     */
    static async editRecipe(req, res) {
        try {
            const recipeId = req.params.id;
            const updatedRecipe = await admin_service_1.AdminService.editRecipe(recipeId, req.body);
            res.status(200).json({ message: "Recipe updated successfully by admin.", recipe: updatedRecipe });
        }
        catch (error) {
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
    static async deleteRecipe(req, res) {
        try {
            const recipeId = req.params.id;
            await admin_service_1.AdminService.deleteRecipe(recipeId);
            res.status(200).json({ message: "Recipe deleted successfully by admin." });
        }
        catch (error) {
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
    static async toggleFeaturedRecipe(req, res) {
        try {
            const recipeId = req.params.id;
            const result = await admin_service_1.AdminService.toggleFeaturedRecipe(recipeId);
            res.status(200).json({ message: "Recipe featured status toggled successfully.", data: result });
        }
        catch (error) {
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
    static async listAggregatedReports(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status || "pending";
            const data = await admin_service_1.AdminService.listAggregatedReports(page, limit, status);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Admin List Aggregated Reports Error:", error);
            res.status(500).json({ error: "Internal server error while retrieving reports." });
        }
    }
    /**
     * Get all individual report documents for a recipeId.
     */
    static async getReportDetails(req, res) {
        try {
            const recipeId = req.params.recipeId;
            const details = await admin_service_1.AdminService.getReportDetailsByRecipe(recipeId);
            res.status(200).json({ details });
        }
        catch (error) {
            console.error("Admin Get Report Details Error:", error);
            res.status(500).json({ error: "Internal server error while fetching report details." });
        }
    }
    /**
     * Dismiss all reports linked to a recipeId.
     */
    static async dismissReports(req, res) {
        try {
            const recipeId = req.params.recipeId;
            const result = await admin_service_1.AdminService.dismissReportsByRecipe(recipeId);
            res.status(200).json({ message: "Reports dismissed successfully.", data: result });
        }
        catch (error) {
            console.error("Admin Dismiss Reports Error:", error);
            res.status(500).json({ error: "Internal server error while dismissing reports." });
        }
    }
    /**
     * List all moderation reports.
     */
    static async listReports(req, res) {
        try {
            const reports = await admin_service_1.AdminService.listReports();
            res.status(200).json({ reports });
        }
        catch (error) {
            console.error("Admin List Reports Error:", error);
            res.status(500).json({ error: "Internal server error during reports retrieval." });
        }
    }
    /**
     * Toggle report status.
     */
    static async toggleReportStatus(req, res) {
        try {
            const reportId = req.params.id;
            const result = await admin_service_1.AdminService.toggleReportStatus(reportId);
            res.status(200).json({ message: "Report status toggled successfully.", data: result });
        }
        catch (error) {
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
    static async deleteReportedRecipe(req, res) {
        try {
            const reportId = req.params.id;
            await admin_service_1.AdminService.deleteReportedRecipe(reportId);
            res.status(200).json({ message: "Offending recipe deleted and report resolved successfully." });
        }
        catch (error) {
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
    static async listTransactions(req, res) {
        try {
            const transactions = await admin_service_1.AdminService.listTransactions();
            res.status(200).json({ transactions });
        }
        catch (error) {
            console.error("Admin List Transactions Error:", error);
            res.status(500).json({ error: "Internal server error while retrieving transactions." });
        }
    }
}
exports.AdminController = AdminController;
