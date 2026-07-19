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
    // --- REVENUE & WITHDRAWALS ---
    static async getRevenueStats(req, res) {
        try {
            const stats = await admin_service_1.AdminService.getRevenueStats();
            res.status(200).json({ success: true, stats });
        }
        catch (error) {
            console.error("Admin Revenue Stats Error:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    }
    static async createWithdrawal(req, res) {
        try {
            const { amount, note } = req.body;
            const adminEmail = req.user?.email || "admin@system.com";
            const withdrawal = await admin_service_1.AdminService.createWithdrawal(adminEmail, Number(amount), note);
            res.status(201).json({ success: true, withdrawal });
        }
        catch (error) {
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
    static async listWithdrawals(req, res) {
        try {
            const withdrawals = await admin_service_1.AdminService.listWithdrawals();
            res.status(200).json({ success: true, withdrawals });
        }
        catch (error) {
            console.error("Admin List Withdrawals Error:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    }
    // --- CATEGORIES ---
    static async listCategories(req, res) {
        try {
            const categories = await admin_service_1.AdminService.listCategories();
            res.status(200).json({ success: true, categories });
        }
        catch (error) {
            console.error("Admin List Categories Error:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    }
    static async createCategory(req, res) {
        try {
            const { name, description } = req.body;
            if (!name) {
                res.status(400).json({ error: "Category name is required." });
                return;
            }
            const category = await admin_service_1.AdminService.createCategory(name, description || "");
            res.status(201).json({ success: true, category });
        }
        catch (error) {
            if (error.message === "CATEGORY_EXISTS") {
                res.status(400).json({ error: "Category already exists." });
                return;
            }
            console.error("Admin Create Category Error:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    }
    static async deleteCategory(req, res) {
        try {
            const categoryId = req.params.id;
            await admin_service_1.AdminService.deleteCategory(categoryId);
            res.status(200).json({ success: true, message: "Category deleted." });
        }
        catch (error) {
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
    static async listBroadcasts(req, res) {
        try {
            const broadcasts = await admin_service_1.AdminService.listBroadcasts();
            res.status(200).json({ success: true, broadcasts });
        }
        catch (error) {
            console.error("Admin List Broadcasts Error:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    }
    static async createBroadcast(req, res) {
        try {
            const { subject, message } = req.body;
            const adminEmail = req.user?.email || "admin@system.com";
            if (!subject || !message) {
                res.status(400).json({ error: "Subject and message are required." });
                return;
            }
            const broadcast = await admin_service_1.AdminService.createBroadcast(adminEmail, subject, message);
            res.status(201).json({ success: true, broadcast });
        }
        catch (error) {
            console.error("Admin Create Broadcast Error:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    }
}
exports.AdminController = AdminController;
