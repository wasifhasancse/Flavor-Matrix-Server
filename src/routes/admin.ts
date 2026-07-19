import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { verifyToken } from "../middlewares/auth";
import { adminCheck } from "../middlewares/admin";

const router = Router();

// Protect all admin routes with authentication & admin role validations
router.use(verifyToken as any, adminCheck as any);

// Analytics Stats
router.get("/stats", AdminController.getStats);

// User Management Toggles & Aggregations
router.get("/users", AdminController.listUsers);
router.patch("/users/:id/status", AdminController.toggleUserBlock);
router.patch("/users/:id/block", AdminController.toggleUserBlock);

// Recipe Moderation Override & List
router.get("/recipes", AdminController.listRecipes);
router.put("/recipes/:id", AdminController.editRecipe);
router.delete("/recipes/:id", AdminController.deleteRecipe);
router.patch("/recipes/:id/feature", AdminController.toggleFeaturedRecipe);
router.patch("/recipes/:id/toggle-featured", AdminController.toggleFeaturedRecipe);

// Flagged Content & Moderation Reports Queue
router.get("/reports", AdminController.listAggregatedReports);
router.get("/reports/:recipeId/details", AdminController.getReportDetails);
router.patch("/reports/:recipeId/dismiss", AdminController.dismissReports);
router.patch("/reports/:id/resolve", AdminController.toggleReportStatus);
router.delete("/reports/:id/recipe", AdminController.deleteReportedRecipe);

// Financial logs & Revenue
router.get("/transactions", AdminController.listTransactions);
router.get("/revenue", AdminController.getRevenueStats);
router.post("/withdraw", AdminController.createWithdrawal);
router.get("/withdrawals", AdminController.listWithdrawals);

// Categories Management
router.get("/categories", AdminController.listCategories);
router.post("/categories", AdminController.createCategory);
router.delete("/categories/:id", AdminController.deleteCategory);

// Broadcasts & Newsletters
router.get("/broadcasts", AdminController.listBroadcasts);
router.post("/broadcasts", AdminController.createBroadcast);

export const adminRouter = router;
