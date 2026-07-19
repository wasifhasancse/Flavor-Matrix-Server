"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionService = void 0;
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
class InteractionService {
    /**
     * Likes a recipe by incrementing the likesCount field.
     */
    static async likeRecipe(recipeId) {
        if (!mongodb_1.ObjectId.isValid(recipeId)) {
            throw new Error("INVALID_ID");
        }
        const recipe = await db_1.collections.recipes.findOne({
            _id: new mongodb_1.ObjectId(recipeId),
        });
        if (!recipe) {
            throw new Error("NOT_FOUND");
        }
        // Increment likesCount field as per DB architecture
        await db_1.collections.recipes.updateOne({ _id: new mongodb_1.ObjectId(recipeId) }, { $inc: { likesCount: 1, likes: 1 } });
        return { likesCount: (recipe.likesCount || recipe.likes || 0) + 1 };
    }
    /**
     * Toggles bookmarking a recipe.
     * Uses favorites collection schema: userEmail, userId, recipeId, addedAt.
     */
    static async toggleFavorite(userId, userEmail, recipeId) {
        if (!mongodb_1.ObjectId.isValid(recipeId)) {
            throw new Error("INVALID_ID");
        }
        const recipe = await db_1.collections.recipes.findOne({
            _id: new mongodb_1.ObjectId(recipeId),
        });
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
            // Add favorite with specified DB architecture fields
            const favDoc = {
                userEmail,
                userId,
                recipeId,
                addedAt: new Date(),
            };
            const result = await db_1.collections.favorites.insertOne(favDoc);
            return {
                favorited: true,
                favorite: { ...favDoc, _id: result.insertedId },
            };
        }
    }
    /**
     * Registers a report for a recipe.
     * Uses reports collection schema: recipeId, reporterEmail, reason, status, createdAt.
     */
    static async reportRecipe(recipeId, reporterEmail, reason) {
        if (!mongodb_1.ObjectId.isValid(recipeId)) {
            throw new Error("INVALID_ID");
        }
        const recipe = await db_1.collections.recipes.findOne({
            _id: new mongodb_1.ObjectId(recipeId),
        });
        if (!recipe) {
            throw new Error("NOT_FOUND");
        }
        const reportDoc = {
            recipeId,
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
