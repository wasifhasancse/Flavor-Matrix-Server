"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionController = void 0;
const interaction_service_1 = require("../services/interaction.service");
class InteractionController {
    /**
     * Controller to like a recipe.
     */
    static async likeRecipe(req, res) {
        try {
            const { recipeId } = req.body;
            if (!recipeId) {
                res.status(400).json({ error: "Missing recipeId in request body." });
                return;
            }
            const result = await interaction_service_1.InteractionService.likeRecipe(recipeId);
            res.status(200).json({ message: "Recipe liked successfully.", data: result });
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
            console.error("Like Recipe Controller Error:", error);
            res.status(500).json({ error: "Internal server error while liking recipe." });
        }
    }
    /**
     * Controller to toggle bookmarking a recipe.
     */
    static async toggleFavorite(req, res) {
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
            const result = await interaction_service_1.InteractionService.toggleFavorite(user.id, recipeId);
            if (result.favorited) {
                res.status(200).json({ message: "Recipe added to favorites.", favorited: true });
            }
            else {
                res.status(200).json({ message: "Recipe removed from favorites.", favorited: false });
            }
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
            console.error("Toggle Favorite Controller Error:", error);
            res.status(500).json({ error: "Internal server error while toggling favorite." });
        }
    }
    /**
     * Controller to submit a recipe moderation report.
     */
    static async reportRecipe(req, res) {
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
            const newReport = await interaction_service_1.InteractionService.reportRecipe(recipeId, user.email, reason);
            res.status(201).json({ message: "Recipe reported successfully.", report: newReport });
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
            console.error("Report Recipe Controller Error:", error);
            res.status(500).json({ error: "Internal server error while submitting report." });
        }
    }
}
exports.InteractionController = InteractionController;
