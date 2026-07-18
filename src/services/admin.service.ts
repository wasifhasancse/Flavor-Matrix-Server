import { ObjectId } from "mongodb";
import { collections } from "../config/db";

export class AdminService {
  /**
   * Fetches total aggregates across all collections.
   */
  static async getStats() {
    const [totalUsers, totalRecipes, premiumUsers, activeReports] = await Promise.all([
      collections.users.countDocuments({}),
      collections.recipes.countDocuments({}),
      collections.users.countDocuments({ isPremium: true }),
      collections.reports.countDocuments({ status: "pending" }),
    ]);

    return {
      totalUsers,
      totalRecipes,
      premiumUsers,
      activeReports,
    };
  }

  /**
   * Aggregates users with totalMoneySpent from payments collection, server-side search & pagination.
   */
  static async listUsers(page = 1, limit = 10, search = "") {
    const skip = (page - 1) * limit;

    const matchStage: any = {};
    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      matchStage.$or = [{ name: regex }, { email: regex }];
    }

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: "payments",
          let: { userId: "$_id", userEmail: "$email" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [
                        { $eq: ["$userId", "$$userId"] },
                        { $eq: ["$userId", { $toString: "$$userId" }] },
                        { $eq: ["$userEmail", "$$userEmail"] },
                      ],
                    },
                    {
                      $in: ["$paymentStatus", ["succeeded", "paid"]],
                    },
                  ],
                },
              },
            },
          ],
          as: "joinedPayments",
        },
      },
      {
        $addFields: {
          totalMoneySpent: {
            $sum: "$joinedPayments.amount",
          },
        },
      },
      {
        $project: {
          joinedPayments: 0,
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await collections.users.aggregate(pipeline).toArray();

    const facet = result[0] || { data: [], totalCount: [] };
    const data = facet.data || [];
    const totalCount = facet.totalCount[0]?.count || 0;

    return {
      users: data,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  }

  /**
   * Toggles isBlocked status for a user.
   */
  static async toggleUserBlock(userId: string) {
    if (!ObjectId.isValid(userId)) {
      throw new Error("INVALID_ID");
    }

    const user = await collections.users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error("NOT_FOUND");
    }

    const newBlockedState = !user.isBlocked;
    await collections.users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isBlocked: newBlockedState, updatedAt: new Date() } }
    );

    return { id: userId, isBlocked: newBlockedState };
  }

  /**
   * Edits any recipe.
   */
  static async editRecipe(recipeId: string, updateData: any) {
    if (!ObjectId.isValid(recipeId)) {
      throw new Error("INVALID_ID");
    }

    const recipe = await collections.recipes.findOne({ _id: new ObjectId(recipeId) });
    if (!recipe) {
      throw new Error("NOT_FOUND");
    }

    const cleanUpdate: any = {};
    const allowedKeys = [
      "title",
      "description",
      "image",
      "prepTime",
      "cookTime",
      "difficulty",
      "category",
      "ingredients",
      "instructions",
      "price",
      "isFeatured",
    ];

    allowedKeys.forEach((key) => {
      if (updateData[key] !== undefined) {
        cleanUpdate[key] = updateData[key];
      }
    });

    cleanUpdate.updatedAt = new Date();

    await collections.recipes.updateOne({ _id: new ObjectId(recipeId) }, { $set: cleanUpdate });
    return { ...recipe, ...cleanUpdate };
  }

  /**
   * Deletes any recipe.
   */
  static async deleteRecipe(recipeId: string) {
    if (!ObjectId.isValid(recipeId)) {
      throw new Error("INVALID_ID");
    }

    const recipe = await collections.recipes.findOne({ _id: new ObjectId(recipeId) });
    if (!recipe) {
      throw new Error("NOT_FOUND");
    }

    await collections.recipes.deleteOne({ _id: new ObjectId(recipeId) });
    
    // Auto-resolve corresponding reports
    await collections.reports.updateMany(
      { recipeId: recipeId },
      { $set: { status: "resolved", updatedAt: new Date() } }
    );

    return { success: true };
  }

  /**
   * Toggles isFeatured status of a recipe.
   */
  static async toggleFeaturedRecipe(recipeId: string) {
    if (!ObjectId.isValid(recipeId)) {
      throw new Error("INVALID_ID");
    }

    const recipe = await collections.recipes.findOne({ _id: new ObjectId(recipeId) });
    if (!recipe) {
      throw new Error("NOT_FOUND");
    }

    const newFeaturedState = !recipe.isFeatured;
    await collections.recipes.updateOne(
      { _id: new ObjectId(recipeId) },
      { $set: { isFeatured: newFeaturedState, updatedAt: new Date() } }
    );

    return { id: recipeId, isFeatured: newFeaturedState };
  }

  /**
   * Lists all moderation reports.
   */
  static async listReports() {
    return await collections.reports.find({}).sort({ createdAt: -1 }).toArray();
  }

  /**
   * Toggles report status between 'pending' and 'resolved'.
   */
  static async toggleReportStatus(reportId: string) {
    if (!ObjectId.isValid(reportId)) {
      throw new Error("INVALID_ID");
    }

    const report = await collections.reports.findOne({ _id: new ObjectId(reportId) });
    if (!report) {
      throw new Error("NOT_FOUND");
    }

    const nextStatus = report.status === "pending" ? "resolved" : "pending";
    await collections.reports.updateOne(
      { _id: new ObjectId(reportId) },
      { $set: { status: nextStatus, updatedAt: new Date() } }
    );

    return { id: reportId, status: nextStatus };
  }

  /**
   * Deletes the reported recipe associated with a report, and resolves the report.
   */
  static async deleteReportedRecipe(reportId: string) {
    if (!ObjectId.isValid(reportId)) {
      throw new Error("INVALID_ID");
    }

    const report = await collections.reports.findOne({ _id: new ObjectId(reportId) });
    if (!report) {
      throw new Error("NOT_FOUND");
    }

    const recipeId = report.recipeId;
    if (ObjectId.isValid(recipeId)) {
      await collections.recipes.deleteOne({ _id: new ObjectId(recipeId) });
    }

    // Resolve this report and all other reports for this recipe
    await collections.reports.updateMany(
      { recipeId: recipeId },
      { $set: { status: "resolved", updatedAt: new Date() } }
    );

    return { success: true };
  }

  /**
   * Lists all transactions.
   */
  static async listTransactions() {
    return await collections.payments.find({}).sort({ createdAt: -1 }).toArray();
  }
}
