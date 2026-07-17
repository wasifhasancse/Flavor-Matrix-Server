import { Request, Response } from "express";
import { RecipeService } from "../services/recipe.service";

export class RecipeController {
  /**
   * Controller for recipe creation.
   */
  static async createRecipe(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user; // Appended by verifyToken middleware

      if (!user) {
        res.status(401).json({ error: "Unauthorized. User session not found." });
        return;
      }

      const {
        title,
        description,
        image,
        prepTime,
        cookTime,
        difficulty,
        category,
        ingredients,
        instructions,
        price,
      } = req.body;

      if (!title || !description || !ingredients || !instructions) {
        res.status(400).json({ error: "Missing required fields (title, description, ingredients, instructions)." });
        return;
      }

      const recipeInput = {
        title,
        description,
        image: image || "",
        prepTime: prepTime || "10 mins",
        cookTime: cookTime || "15 mins",
        difficulty: difficulty || "Easy",
        category: category || "Other",
        ingredients,
        instructions,
        price: price ? Number(price) : undefined,
        authorId: user.id,
        author: user.email.split("@")[0] || "Home Chef",
      };

      const newRecipe = await RecipeService.createRecipe(user.id, recipeInput);
      res.status(201).json({ message: "Recipe created successfully.", recipe: newRecipe });
    } catch (error: any) {
      if (error.message === "LIMIT_EXCEEDED") {
        res.status(403).json({
          error: "Recipe creation limit reached. Free accounts can only publish up to 2 recipes. Upgrade to Premium to unlock unlimited creations.",
        });
        return;
      }

      console.error("Create Recipe Controller Error:", error);
      res.status(500).json({ error: "Internal server error during recipe creation." });
    }
  }

  /**
   * Controller to get all recipes with pagination & filtering.
   */
  static async getRecipes(req: Request, res: Response): Promise<void> {
    try {
      const { category, page, limit } = req.query;

      const result = await RecipeService.getRecipes({
        category: category as string,
        page: page as string,
        limit: limit as string,
      });

      res.status(200).json(result);
    } catch (error) {
      console.error("Get Recipes Controller Error:", error);
      res.status(500).json({ error: "Internal server error during recipe retrieval." });
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
      res.status(500).json({ error: "Internal server error during recipe lookup." });
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
        res.status(401).json({ error: "Unauthorized. User session not found." });
        return;
      }

      const updated = await RecipeService.updateRecipe(id, user.id, user.role, req.body);
      res.status(200).json({ message: "Recipe updated successfully.", recipe: updated });
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
        res.status(403).json({ error: "Forbidden. You are not authorized to update this recipe." });
        return;
      }

      console.error("Update Recipe Controller Error:", error);
      res.status(500).json({ error: "Internal server error during recipe update." });
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
        res.status(401).json({ error: "Unauthorized. User session not found." });
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
        res.status(403).json({ error: "Forbidden. You are not authorized to delete this recipe." });
        return;
      }

      console.error("Delete Recipe Controller Error:", error);
      res.status(500).json({ error: "Internal server error during recipe deletion." });
    }
  }
}
