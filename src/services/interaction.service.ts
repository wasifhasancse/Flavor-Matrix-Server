import { ObjectId } from "mongodb";
import { collections } from "../config/db";

export class InteractionService {
  /**
   * Likes a recipe by incrementing the likes counter field.
   */
  static async likeRecipe(recipeId: string) {
    if (!ObjectId.isValid(recipeId)) {
      throw new Error("INVALID_ID");
    }

    const recipe = await collections.recipes.findOne({ _id: new ObjectId(recipeId) });
    if (!recipe) {
      throw new Error("NOT_FOUND");
    }

    // Increment likes
    await collections.recipes.updateOne(
      { _id: new ObjectId(recipeId) },
      { $inc: { likes: 1 } }
    );

    return { likes: (recipe.likes || 0) + 1 };
  }

  /**
   * Toggles bookmarking a recipe.
   * Creates a favorite document if missing, deletes it if it already exists.
   */
  static async toggleFavorite(userId: string, recipeId: string) {
    if (!ObjectId.isValid(recipeId)) {
      throw new Error("INVALID_ID");
    }

    const recipe = await collections.recipes.findOne({ _id: new ObjectId(recipeId) });
    if (!recipe) {
      throw new Error("NOT_FOUND");
    }

    const query = { userId, recipeId };
    const existing = await collections.favorites.findOne(query);

    if (existing) {
      // Remove favorite
      await collections.favorites.deleteOne(query);
      return { favorited: false };
    } else {
      // Add favorite
      await collections.favorites.insertOne({
        ...query,
        createdAt: new Date(),
      });
      return { favorited: true };
    }
  }

  /**
   * Registers a moderation report for a recipe.
   */
  static async reportRecipe(recipeId: string, reporterEmail: string, reason: string) {
    if (!ObjectId.isValid(recipeId)) {
      throw new Error("INVALID_ID");
    }

    const recipe = await collections.recipes.findOne({ _id: new ObjectId(recipeId) });
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

    const result = await collections.reports.insertOne(reportDoc);
    return { ...reportDoc, _id: result.insertedId };
  }
}
