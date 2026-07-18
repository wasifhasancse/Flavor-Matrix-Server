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
// User Management Toggles
router.patch("/users/:id/block", admin_controller_1.AdminController.toggleUserBlock);
// Recipe Moderation Override
router.put("/recipes/:id", admin_controller_1.AdminController.editRecipe);
router.delete("/recipes/:id", admin_controller_1.AdminController.deleteRecipe);
router.patch("/recipes/:id/toggle-featured", admin_controller_1.AdminController.toggleFeaturedRecipe);
// Flagged Content & Moderation Reports
router.get("/reports", admin_controller_1.AdminController.listReports);
router.patch("/reports/:id/resolve", admin_controller_1.AdminController.toggleReportStatus);
router.delete("/reports/:id/recipe", admin_controller_1.AdminController.deleteReportedRecipe);
// Financial logs
router.get("/transactions", admin_controller_1.AdminController.listTransactions);
exports.adminRouter = router;
