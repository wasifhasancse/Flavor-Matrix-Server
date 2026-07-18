import { ObjectId } from "mongodb";
import { collections } from "../config/db";

export class RatingService {
  /**
   * Rates a recipe (ensuring single rating per user) and updates averageRating & totalRatings count on target recipe document.
   */
  static async rateRecipe(userId: string, recipeId: string, score: number) {
    if (score < 1 || score > 5) {
      throw new Error("INVALID_SCORE");
    }

    const query = ObjectId.isValid(recipeId)
      ? { $or: [{ _id: new ObjectId(recipeId) }, { id: recipeId }] }
      : { id: recipeId };

    const recipe = await collections.recipes.findOne(query);
    if (!recipe) {
      throw new Error("NOT_FOUND");
    }

    // Check if user has already rated this recipe
    const existingRating = await collections.ratings.findOne({
      userId,
      recipeId,
    });

    const now = new Date();

    if (existingRating) {
      await collections.ratings.updateOne(
        { _id: existingRating._id },
        { $set: { score, updatedAt: now } }
      );
    } else {
      await collections.ratings.insertOne({
        userId,
        recipeId,
        score,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Aggregate average rating & total reviews count
    const ratingStats = await collections.ratings
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
    await collections.recipes.updateOne(query, {
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
