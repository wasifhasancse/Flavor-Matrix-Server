import { Request, Response } from "express";
import { RatingService } from "../services/rating.service";
import { RecipeService } from "../services/recipe.service";

export class RecipeController {
  /**
   * Controller for recipe creation.
   */
  static async createRecipe(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user; // Appended by verifyToken middleware

      if (!user) {
        res
          .status(401)
          .json({ error: "Unauthorized. User session not found." });
        return;
      }

      const {
        recipeName,
        title,
        recipeImage,
        image,
        category,
        cuisineType,
        difficultyLevel,
        difficulty,
        preparationTime,
        prepTime,
        ingredients,
        instructions,
        price,
        status,
      } = req.body;

      const finalRecipeName = recipeName || title;
      const finalRecipeImage = recipeImage || image || "";

      if (!finalRecipeName || !ingredients || !instructions) {
        res
          .status(400)
          .json({
            error:
              "Missing required fields (recipeName, ingredients, instructions).",
          });
        return;
      }

      const recipeInput = {
        recipeName: finalRecipeName,
        description: req.body.description || "",
        recipeImage: finalRecipeImage,
        category: category || "Other",
        cuisineType: cuisineType || "International",
        difficultyLevel: (difficultyLevel || difficulty || "Easy") as
          | "Easy"
          | "Medium"
          | "Hard",
        preparationTime: preparationTime || prepTime || "15 mins",
        ingredients,
        instructions,
        authorId: user.id,
        authorName: user.email ? user.email.split("@")[0] : "Home Chef",
        authorEmail: user.email || "",
        price: price ? Number(price) : undefined,
        status: status || (price ? "premium" : "free"),
      };

      const newRecipe = await RecipeService.createRecipe(user.id, recipeInput);
      res
        .status(201)
        .json({ message: "Recipe created successfully.", recipe: newRecipe });
    } catch (error: any) {
      if (error.message === "LIMIT_EXCEEDED_FREE") {
        res.status(403).json({
          error: "Recipe creation limit reached. Free accounts can only publish up to 2 recipes. Upgrade to Pro or Premium to unlock higher limits!",
        });
        return;
      }
      
      if (error.message === "LIMIT_EXCEEDED_PRO") {
        res.status(403).json({
          error: "Recipe creation limit reached. Pro accounts can only publish up to 10 recipes per month. Upgrade to Premium to unlock unlimited creations!",
        });
        return;
      }

      console.error("Create Recipe Controller Error:", error);
      res
        .status(500)
        .json({ error: "Internal server error during recipe creation." });
    }
  }

  /**
   * Controller to get all recipes with server-side pagination & category filtering.
   */
  static async getRecipes(req: Request, res: Response): Promise<void> {
    try {
      const {
        category,
        categories,
        page,
        limit,
        search,
        difficultyLevel,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await RecipeService.getRecipes({
        category: category as any,
        categories: categories as any,
        page: page as string,
        limit: limit as string,
        search: search as string,
        difficultyLevel: difficultyLevel as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as string,
      });

      res.status(200).json(result);
    } catch (error) {
      console.error("Get Recipes Controller Error:", error);
      res
        .status(500)
        .json({
          error: "Internal server error during recipe retrieval.",
          details: (error as Error).message,
          stack: (error as Error).stack,
        });
    }
  }

  /**
   * Controller to get single recipe by ID.
   */
  static async getRecipeById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const recipe = await RecipeService.getRecipeById(id);
      res.status(200).json({ recipe });
    } catch (error: any) {
      if (error.message === "INVALID_ID") {
        res.status(400).json({ error: "Invalid recipe ID format." });
        return;
      }
      if (error.message === "NOT_FOUND") {
        res.status(404).json({ error: "Recipe not found." });
        return;
      }

      console.error("Get Recipe By ID Controller Error:", error);
      res
        .status(500)
        .json({ error: "Internal server error during recipe lookup." });
    }
  }

  /**
   * Controller to update a recipe.
   */
  static async updateRecipe(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = req.user;

      if (!user) {
        res
          .status(401)
          .json({ error: "Unauthorized. User session not found." });
        return;
      }

      const updated = await RecipeService.updateRecipe(
        id,
        user.id,
        user.role,
        req.body,
      );
      res
        .status(200)
        .json({ message: "Recipe updated successfully.", recipe: updated });
    } catch (error: any) {
      if (error.message === "INVALID_ID") {
        res.status(400).json({ error: "Invalid recipe ID format." });
        return;
      }
      if (error.message === "NOT_FOUND") {
        res.status(404).json({ error: "Recipe not found." });
        return;
      }
      if (error.message === "UNAUTHORIZED") {
        res
          .status(403)
          .json({
            error: "Forbidden. You are not authorized to update this recipe.",
          });
        return;
      }

      console.error("Update Recipe Controller Error:", error);
      res
        .status(500)
        .json({ error: "Internal server error during recipe update." });
    }
  }

  /**
   * Controller to delete a recipe.
   */
  static async deleteRecipe(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = req.user;

      if (!user) {
        res
          .status(401)
          .json({ error: "Unauthorized. User session not found." });
        return;
      }

      await RecipeService.deleteRecipe(id, user.id, user.role);
      res.status(200).json({ message: "Recipe deleted successfully." });
    } catch (error: any) {
      if (error.message === "INVALID_ID") {
        res.status(400).json({ error: "Invalid recipe ID format." });
        return;
      }
      if (error.message === "NOT_FOUND") {
        res.status(404).json({ error: "Recipe not found." });
        return;
      }
      if (error.message === "UNAUTHORIZED") {
        res
          .status(403)
          .json({
            error: "Forbidden. You are not authorized to delete this recipe.",
          });
        return;
      }

      console.error("Delete Recipe Controller Error:", error);
      res
        .status(500)
        .json({ error: "Internal server error during recipe deletion." });
    }
  }

  /**
   * Controller to rate a recipe.
   */
  static async rateRecipe(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: "Unauthorized. User session required." });
        return;
      }

      const recipeId = req.params.id as string;
      const { score } = req.body;

      if (!score || typeof score !== "number") {
        res
          .status(400)
          .json({
            error: "Invalid rating score. Provide a number between 1 and 5.",
          });
        return;
      }

      const result = await RatingService.rateRecipe(user.id, recipeId, score);
      res
        .status(200)
        .json({ message: "Rating submitted successfully.", data: result });
    } catch (error: any) {
      if (error.message === "INVALID_SCORE") {
        res
          .status(400)
          .json({ error: "Rating score must be between 1 and 5 stars." });
        return;
      }
      if (error.message === "NOT_FOUND") {
        res.status(404).json({ error: "Recipe not found." });
        return;
      }

      console.error("Rate Recipe Controller Error:", error);
      res
        .status(500)
        .json({
          error: "Internal server error during recipe rating submission.",
        });
    }
  }
}
