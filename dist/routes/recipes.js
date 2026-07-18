"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recipesRouter = void 0;
const express_1 = require("express");
const recipe_controller_1 = require("../controllers/recipe.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Public Routes
router.get("/", recipe_controller_1.RecipeController.getRecipes);
router.get("/:id", recipe_controller_1.RecipeController.getRecipeById);
// Protected Routes (Authentication Required)
router.post("/", auth_1.verifyToken, recipe_controller_1.RecipeController.createRecipe);
router.put("/:id", auth_1.verifyToken, recipe_controller_1.RecipeController.updateRecipe);
router.delete("/:id", auth_1.verifyToken, recipe_controller_1.RecipeController.deleteRecipe);
exports.recipesRouter = router;
