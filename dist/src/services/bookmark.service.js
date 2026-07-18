"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkService = void 0;
const db_1 = require("../config/db");
class BookmarkService {
    /**
     * Toggles bookmark state for a recipe.
     */
    static async toggleBookmark(userId, userEmail, recipeId) {
        const existing = await db_1.collections.bookmarks.findOne({
            userId,
            recipeId,
        });
        if (existing) {
            await db_1.collections.bookmarks.deleteOne({ _id: existing._id });
            return { isBookmarked: false, message: "Bookmark removed successfully." };
        }
        const now = new Date();
        await db_1.collections.bookmarks.insertOne({
            userId,
            userEmail,
            recipeId,
            createdAt: now,
        });
        return { isBookmarked: true, message: "Recipe bookmarked successfully." };
    }
    /**
     * Gets user's bookmarked recipes with pagination.
     */
    static async getBookmarks(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const pipeline = [
            { $match: { userId } },
            {
                $lookup: {
                    from: "recipes",
                    let: { rId: "$recipeId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ["$_id", "$$rId"] },
                                        { $eq: ["$id", "$$rId"] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "recipeDetails",
                },
            },
            {
                $unwind: {
                    path: "$recipeDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    bookmarkId: { $toString: "$_id" },
                    recipeId: 1,
                    createdAt: 1,
                    recipe: "$recipeDetails",
                },
            },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{ $count: "count" }],
                },
            },
        ];
        const result = await db_1.collections.bookmarks.aggregate(pipeline).toArray();
        const facet = result[0] || { data: [], totalCount: [] };
        const list = facet.data || [];
        const total = facet.totalCount[0]?.count || 0;
        return {
            bookmarks: list,
            totalCount: total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    /**
     * Deletes a bookmark for a specific recipe.
     */
    static async removeBookmark(userId, recipeId) {
        await db_1.collections.bookmarks.deleteOne({ userId, recipeId });
        return { success: true };
    }
}
exports.BookmarkService = BookmarkService;
