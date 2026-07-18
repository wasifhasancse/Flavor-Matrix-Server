"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionService = void 0;
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
class InteractionService {
    /**
     * Likes a recipe by incrementing the likes counter field.
     */
    static async likeRecipe(recipeId) {
        if (!mongodb_1.ObjectId.isValid(recipeId)) {
            throw new Error("INVALID_ID");
        }
        const recipe = await db_1.collections.recipes.findOne({ _id: new mongodb_1.ObjectId(recipeId) });
        if (!recipe) {
            throw new Error("NOT_FOUND");
        }
        // Increment likes
        await db_1.collections.recipes.updateOne({ _id: new mongodb_1.ObjectId(recipeId) }, { $inc: { likes: 1 } });
        return { likes: (recipe.likes || 0) + 1 };
    }
    /**
     * Toggles bookmarking a recipe.
     * Creates a favorite document if missing, deletes it if it already exists.
     */
    static async toggleFavorite(userId, recipeId) {
        if (!mongodb_1.ObjectId.isValid(recipeId)) {
            throw new Error("INVALID_ID");
        }
        const recipe = await db_1.collections.recipes.findOne({ _id: new mongodb_1.ObjectId(recipeId) });
        if (!recipe) {
            throw new Error("NOT_FOUND");
        }
        const query = { userId, recipeId };
        const existing = await db_1.collections.favorites.findOne(query);
        if (existing) {
            // Remove favorite
            await db_1.collections.favorites.deleteOne(query);
            return { favorited: false };
        }
        else {
            // Add favorite
            await db_1.collections.favorites.insertOne({
                ...query,
                createdAt: new Date(),
            });
            return { favorited: true };
        }
    }
    /**
     * Registers a moderation report for a recipe.
     */
    static async reportRecipe(recipeId, reporterEmail, reason) {
        if (!mongodb_1.ObjectId.isValid(recipeId)) {
            throw new Error("INVALID_ID");
        }
        const recipe = await db_1.collections.recipes.findOne({ _id: new mongodb_1.ObjectId(recipeId) });
        if (!recipe) {
            throw new Error("NOT_FOUND");
        }
        const reportDoc = {
            recipeId,
            recipeTitle: recipe.title,
            reporterEmail,
            reason,
            status: "pending",
            createdAt: new Date(),
        };
        const result = await db_1.collections.reports.insertOne(reportDoc);
        return { ...reportDoc, _id: result.insertedId };
    }
}
exports.InteractionService = InteractionService;
