import { Request, Response } from "express";
import { InteractionService } from "../services/interaction.service";

export class InteractionController {
  /**
   * Controller to like a recipe.
   */
  static async likeRecipe(req: Request, res: Response): Promise<void> {
    try {
      const { recipeId } = req.body;

      if (!recipeId) {
        res.status(400).json({ error: "Missing recipeId in request body." });
        return;
      }

      const result = await InteractionService.likeRecipe(recipeId);
      res.status(200).json({ message: "Recipe liked successfully.", data: result });
    } catch (error: any) {
      if (error.message === "INVALID_ID") {
        res.status(400).json({ error: "Invalid recipe ID format." });
        return;
      }
      if (error.message === "NOT_FOUND") {
        res.status(404).json({ error: "Recipe not found." });
        return;
      }

      console.error("Like Recipe Controller Error:", error);
      res.status(500).json({ error: "Internal server error while liking recipe." });
    }
  }

  /**
   * Controller to toggle bookmarking a recipe.
   */
  static async toggleFavorite(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { recipeId } = req.body;

      if (!user) {
        res.status(401).json({ error: "Unauthorized. User session not found." });
        return;
      }

      if (!recipeId) {
        res.status(400).json({ error: "Missing recipeId in request body." });
        return;
      }

      const result = await InteractionService.toggleFavorite(user.id, user.email, recipeId);
      
      if (result.favorited) {
        res.status(200).json({ message: "Recipe added to favorites.", favorited: true });
      } else {
        res.status(200).json({ message: "Recipe removed from favorites.", favorited: false });
      }
    } catch (error: any) {
      if (error.message === "INVALID_ID") {
        res.status(400).json({ error: "Invalid recipe ID format." });
        return;
      }
      if (error.message === "NOT_FOUND") {
        res.status(404).json({ error: "Recipe not found." });
        return;
      }

      console.error("Toggle Favorite Controller Error:", error);
      res.status(500).json({ error: "Internal server error while toggling favorite." });
    }
  }

  /**
   * Controller to submit a recipe moderation report.
   */
  static async reportRecipe(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { recipeId, reason } = req.body;

      if (!user) {
        res.status(401).json({ error: "Unauthorized. User session not found." });
        return;
      }

      if (!recipeId || !reason) {
        res.status(400).json({ error: "Missing required fields (recipeId, reason) in request body." });
        return;
      }

      const newReport = await InteractionService.reportRecipe(recipeId, user.email, reason);
      res.status(201).json({ message: "Recipe reported successfully.", report: newReport });
    } catch (error: any) {
      if (error.message === "INVALID_ID") {
        res.status(400).json({ error: "Invalid recipe ID format." });
        return;
      }
      if (error.message === "NOT_FOUND") {
        res.status(404).json({ error: "Recipe not found." });
        return;
      }

      console.error("Report Recipe Controller Error:", error);
      res.status(500).json({ error: "Internal server error while submitting report." });
    }
  }
}
