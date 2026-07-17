import { Router } from "express";
import { RecipeController } from "../controllers/recipe.controller";
import { verifyToken } from "../middlewares/auth";

const router = Router();

// Public Routes
router.get("/", RecipeController.getRecipes);
router.get("/:id", RecipeController.getRecipeById);

// Protected Routes (Authentication Required)
router.post("/", verifyToken as any, RecipeController.createRecipe);
router.put("/:id", verifyToken as any, RecipeController.updateRecipe);
router.delete("/:id", verifyToken as any, RecipeController.deleteRecipe);

export const recipesRouter = router;
