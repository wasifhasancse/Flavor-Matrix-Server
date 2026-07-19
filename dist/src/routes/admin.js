"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middlewares/auth");
const admin_1 = require("../middlewares/admin");
const router = (0, express_1.Router)();
// Protect all admin routes with authentication & admin role validations
router.use(auth_1.verifyToken, admin_1.adminCheck);
// Analytics Stats
router.get("/stats", admin_controller_1.AdminController.getStats);
// User Management Toggles & Aggregations
router.get("/users", admin_controller_1.AdminController.listUsers);
router.patch("/users/:id/status", admin_controller_1.AdminController.toggleUserBlock);
router.patch("/users/:id/block", admin_controller_1.AdminController.toggleUserBlock);
// Recipe Moderation Override & List
router.get("/recipes", admin_controller_1.AdminController.listRecipes);
router.put("/recipes/:id", admin_controller_1.AdminController.editRecipe);
router.delete("/recipes/:id", admin_controller_1.AdminController.deleteRecipe);
router.patch("/recipes/:id/feature", admin_controller_1.AdminController.toggleFeaturedRecipe);
router.patch("/recipes/:id/toggle-featured", admin_controller_1.AdminController.toggleFeaturedRecipe);
// Flagged Content & Moderation Reports Queue
router.get("/reports", admin_controller_1.AdminController.listAggregatedReports);
router.get("/reports/:recipeId/details", admin_controller_1.AdminController.getReportDetails);
router.patch("/reports/:recipeId/dismiss", admin_controller_1.AdminController.dismissReports);
router.patch("/reports/:id/resolve", admin_controller_1.AdminController.toggleReportStatus);
router.delete("/reports/:id/recipe", admin_controller_1.AdminController.deleteReportedRecipe);
// Financial logs & Revenue
router.get("/transactions", admin_controller_1.AdminController.listTransactions);
router.get("/revenue", admin_controller_1.AdminController.getRevenueStats);
router.post("/withdraw", admin_controller_1.AdminController.createWithdrawal);
router.get("/withdrawals", admin_controller_1.AdminController.listWithdrawals);
// Categories Management
router.get("/categories", admin_controller_1.AdminController.listCategories);
router.post("/categories", admin_controller_1.AdminController.createCategory);
router.delete("/categories/:id", admin_controller_1.AdminController.deleteCategory);
// Broadcasts & Newsletters
router.get("/broadcasts", admin_controller_1.AdminController.listBroadcasts);
router.post("/broadcasts", admin_controller_1.AdminController.createBroadcast);
exports.adminRouter = router;
