import { ObjectId } from "mongodb";
import { collections } from "../config/db";
import { FavoriteDoc, ReportDoc } from "../types/database";

export class InteractionService {
  /**
   * Likes a recipe by incrementing the likesCount field.
   */
  static async likeRecipe(recipeId: string) {
    if (!ObjectId.isValid(recipeId)) {
      throw new Error("INVALID_ID");
    }

    const recipe = await collections.recipes.findOne({
      _id: new ObjectId(recipeId),
    });
    if (!recipe) {
      throw new Error("NOT_FOUND");
    }

    // Increment likesCount field as per DB architecture
    await collections.recipes.updateOne(
      { _id: new ObjectId(recipeId) },
      { $inc: { likesCount: 1, likes: 1 } },
    );

    return { likesCount: (recipe.likesCount || recipe.likes || 0) + 1 };
  }

  /**
   * Toggles bookmarking a recipe.
   * Uses favorites collection schema: userEmail, userId, recipeId, addedAt.
   */
  static async toggleFavorite(
    userId: string,
    userEmail: string,
    recipeId: string,
  ) {
    if (!ObjectId.isValid(recipeId)) {
      throw new Error("INVALID_ID");
    }

    const recipe = await collections.recipes.findOne({
      _id: new ObjectId(recipeId),
    });
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
      // Add favorite with specified DB architecture fields
      const favDoc: FavoriteDoc = {
        userEmail,
        userId,
        recipeId,
        addedAt: new Date(),
      };
      const result = await collections.favorites.insertOne(favDoc);
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
  static async reportRecipe(
    recipeId: string,
    reporterEmail: string,
    reason: string,
  ) {
    if (!ObjectId.isValid(recipeId)) {
      throw new Error("INVALID_ID");
    }

    const recipe = await collections.recipes.findOne({
      _id: new ObjectId(recipeId),
    });
    if (!recipe) {
      throw new Error("NOT_FOUND");
    }

    const reportDoc: ReportDoc = {
      recipeId,
      reporterEmail,
      reason,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await collections.reports.insertOne(reportDoc);
    return { ...reportDoc, _id: result.insertedId };
  }
}
