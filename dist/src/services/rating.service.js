"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingService = void 0;
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
class RatingService {
    /**
     * Rates a recipe (ensuring single rating per user) and updates averageRating & totalRatings count on target recipe document.
     */
    static async rateRecipe(userId, recipeId, score) {
        if (score < 1 || score > 5) {
            throw new Error("INVALID_SCORE");
        }
        const query = mongodb_1.ObjectId.isValid(recipeId)
            ? { $or: [{ _id: new mongodb_1.ObjectId(recipeId) }, { id: recipeId }] }
            : { id: recipeId };
        const recipe = await db_1.collections.recipes.findOne(query);
        if (!recipe) {
            throw new Error("NOT_FOUND");
        }
        // Check if user has already rated this recipe
        const existingRating = await db_1.collections.ratings.findOne({
            userId,
            recipeId,
        });
        const now = new Date();
        if (existingRating) {
            await db_1.collections.ratings.updateOne({ _id: existingRating._id }, { $set: { score, updatedAt: now } });
        }
        else {
            await db_1.collections.ratings.insertOne({
                userId,
                recipeId,
                score,
                createdAt: now,
                updatedAt: now,
            });
        }
        // Aggregate average rating & total reviews count
        const ratingStats = await db_1.collections.ratings
            .aggregate([
            { $match: { recipeId } },
            {
                $group: {
                    _id: "$recipeId",
                    avgRating: { $avg: "$score" },
                    totalRatings: { $sum: 1 },
                },
            },
        ])
            .toArray();
        const avg = ratingStats[0]?.avgRating ? Math.round(ratingStats[0].avgRating * 10) / 10 : score;
        const total = ratingStats[0]?.totalRatings || 1;
        // Atomic update of target recipe document
        await db_1.collections.recipes.updateOne(query, {
            $set: {
                averageRating: avg,
                totalRatings: total,
                updatedAt: now,
            },
        });
        return {
            recipeId,
            userRating: score,
            averageRating: avg,
            totalRatings: total,
        };
    }
}
exports.RatingService = RatingService;
