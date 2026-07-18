"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
class AdminService {
    /**
     * Fetches total aggregates across all collections.
     */
    static async getStats() {
        const [totalUsers, totalRecipes, premiumUsers, activeReports] = await Promise.all([
            db_1.collections.users.countDocuments({}),
            db_1.collections.recipes.countDocuments({}),
            db_1.collections.users.countDocuments({ isPremium: true }),
            db_1.collections.reports.countDocuments({ status: "pending" }),
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
        const matchStage = {};
        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");
            matchStage.$or = [{ name: regex }, { email: regex }];
        }
        const pipeline = [
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
        const result = await db_1.collections.users.aggregate(pipeline).toArray();
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
    static async toggleUserBlock(userId) {
        if (!mongodb_1.ObjectId.isValid(userId)) {
            throw new Error("INVALID_ID");
        }
        const user = await db_1.collections.users.findOne({ _id: new mongodb_1.ObjectId(userId) });
        if (!user) {
            throw new Error("NOT_FOUND");
        }
        const newBlockedState = !user.isBlocked;
        await db_1.collections.users.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $set: { isBlocked: newBlockedState, updatedAt: new Date() } });
        return { id: userId, isBlocked: newBlockedState };
    }
    /**
     * Lists all recipes with pagination, searching & category/featured filtering.
     */
    static async listRecipes(page = 1, limit = 10, search = "", category = "all", featured = "all") {
        const skip = (page - 1) * limit;
        const query = {};
        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [
                { title: regex },
                { recipeName: regex },
                { author: regex },
                { authorEmail: regex },
            ];
        }
        if (category && category !== "all") {
            query.category = { $regex: new RegExp(`^${category}$`, "i") };
        }
        if (featured === "featured") {
            query.isFeatured = true;
        }
        else if (featured === "non-featured") {
            query.isFeatured = { $ne: true };
        }
        const [recipes, totalCount] = await Promise.all([
            db_1.collections.recipes.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
            db_1.collections.recipes.countDocuments(query),
        ]);
        return {
            recipes,
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit) || 1,
        };
    }
    /**
     * Edits any recipe.
     */
    static async editRecipe(recipeId, updateData) {
        if (!mongodb_1.ObjectId.isValid(recipeId)) {
            throw new Error("INVALID_ID");
        }
        const recipe = await db_1.collections.recipes.findOne({ _id: new mongodb_1.ObjectId(recipeId) });
        if (!recipe) {
            throw new Error("NOT_FOUND");
        }
        const cleanUpdate = {};
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
        await db_1.collections.recipes.updateOne({ _id: new mongodb_1.ObjectId(recipeId) }, { $set: cleanUpdate });
        return { ...recipe, ...cleanUpdate };
    }
    /**
     * Deletes any recipe.
     */
    static async deleteRecipe(recipeId) {
        if (!mongodb_1.ObjectId.isValid(recipeId)) {
            throw new Error("INVALID_ID");
        }
        const recipe = await db_1.collections.recipes.findOne({ _id: new mongodb_1.ObjectId(recipeId) });
        if (!recipe) {
            throw new Error("NOT_FOUND");
        }
        await db_1.collections.recipes.deleteOne({ _id: new mongodb_1.ObjectId(recipeId) });
        // Auto-resolve corresponding reports
        await db_1.collections.reports.updateMany({ recipeId: recipeId }, { $set: { status: "resolved", updatedAt: new Date() } });
        return { success: true };
    }
    /**
     * Toggles isFeatured status of a recipe.
     */
    static async toggleFeaturedRecipe(recipeId) {
        if (!mongodb_1.ObjectId.isValid(recipeId)) {
            throw new Error("INVALID_ID");
        }
        const recipe = await db_1.collections.recipes.findOne({ _id: new mongodb_1.ObjectId(recipeId) });
        if (!recipe) {
            throw new Error("NOT_FOUND");
        }
        const newFeaturedState = !recipe.isFeatured;
        await db_1.collections.recipes.updateOne({ _id: new mongodb_1.ObjectId(recipeId) }, { $set: { isFeatured: newFeaturedState, updatedAt: new Date() } });
        return { id: recipeId, isFeatured: newFeaturedState };
    }
    /**
     * Aggregates reports by recipeId, joining recipe details, report count & primary reason.
     */
    static async listAggregatedReports(page = 1, limit = 10, status = "pending") {
        const skip = (page - 1) * limit;
        const matchStage = {};
        if (status !== "all") {
            matchStage.status = status;
        }
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: "$recipeId",
                    reportCount: { $sum: 1 },
                    reasons: { $push: "$reason" },
                    latestReportAt: { $max: "$createdAt" },
                },
            },
            {
                $lookup: {
                    from: "recipes",
                    let: { recipeIdStr: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ["$_id", "$$recipeIdStr"] },
                                        { $eq: ["$id", "$$recipeIdStr"] },
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
                    recipeId: "$_id",
                    recipeName: { $ifNull: ["$recipeDetails.title", "$recipeDetails.recipeName", "Reported Item"] },
                    recipeImage: { $ifNull: ["$recipeDetails.image", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"] },
                    authorName: { $ifNull: ["$recipeDetails.author", "$recipeDetails.authorName", "Chef User"] },
                    authorEmail: { $ifNull: ["$recipeDetails.authorEmail", "chef@example.com"] },
                    reportCount: 1,
                    reasons: 1,
                    primaryReason: { $arrayElemAt: ["$reasons", 0] },
                    latestReportAt: 1,
                },
            },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{ $count: "count" }],
                },
            },
        ];
        const result = await db_1.collections.reports.aggregate(pipeline).toArray();
        const facet = result[0] || { data: [], totalCount: [] };
        const data = facet.data || [];
        const totalCount = facet.totalCount[0]?.count || 0;
        return {
            reports: data,
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit) || 1,
        };
    }
    /**
     * Fetches all individual reporting documents matching a recipeId.
     */
    static async getReportDetailsByRecipe(recipeId) {
        const query = mongodb_1.ObjectId.isValid(recipeId)
            ? { $or: [{ recipeId: recipeId }, { recipeId: new mongodb_1.ObjectId(recipeId) }] }
            : { recipeId: recipeId };
        const reports = await db_1.collections.reports.find(query).sort({ createdAt: -1 }).toArray();
        return reports.map((r) => ({
            id: r._id.toString(),
            recipeId: r.recipeId,
            reporterEmail: r.reporterEmail || r.reportedBy || "user@example.com",
            reason: r.reason || "spam",
            createdAt: r.createdAt || new Date(),
        }));
    }
    /**
     * Dismisses all reports linked to a recipeId.
     */
    static async dismissReportsByRecipe(recipeId) {
        const query = mongodb_1.ObjectId.isValid(recipeId)
            ? { $or: [{ recipeId: recipeId }, { recipeId: new mongodb_1.ObjectId(recipeId) }] }
            : { recipeId: recipeId };
        await db_1.collections.reports.updateMany(query, {
            $set: { status: "dismissed", updatedAt: new Date() },
        });
        return { success: true, recipeId };
    }
    /**
     * Lists all moderation reports.
     */
    static async listReports() {
        return await db_1.collections.reports.find({}).sort({ createdAt: -1 }).toArray();
    }
    /**
     * Toggles report status between 'pending' and 'resolved'.
     */
    static async toggleReportStatus(reportId) {
        if (!mongodb_1.ObjectId.isValid(reportId)) {
            throw new Error("INVALID_ID");
        }
        const report = await db_1.collections.reports.findOne({ _id: new mongodb_1.ObjectId(reportId) });
        if (!report) {
            throw new Error("NOT_FOUND");
        }
        const nextStatus = report.status === "pending" ? "resolved" : "pending";
        await db_1.collections.reports.updateOne({ _id: new mongodb_1.ObjectId(reportId) }, { $set: { status: nextStatus, updatedAt: new Date() } });
        return { id: reportId, status: nextStatus };
    }
    /**
     * Deletes the reported recipe associated with a report, and resolves the report.
     */
    static async deleteReportedRecipe(reportId) {
        if (!mongodb_1.ObjectId.isValid(reportId)) {
            throw new Error("INVALID_ID");
        }
        const report = await db_1.collections.reports.findOne({ _id: new mongodb_1.ObjectId(reportId) });
        if (!report) {
            throw new Error("NOT_FOUND");
        }
        const recipeId = report.recipeId;
        if (mongodb_1.ObjectId.isValid(recipeId)) {
            await db_1.collections.recipes.deleteOne({ _id: new mongodb_1.ObjectId(recipeId) });
        }
        await db_1.collections.reports.updateMany({ recipeId: recipeId }, { $set: { status: "resolved", updatedAt: new Date() } });
        return { success: true };
    }
    /**
     * Lists all transactions.
     */
    static async listTransactions() {
        return await db_1.collections.payments.find({}).sort({ createdAt: -1 }).toArray();
    }
}
exports.AdminService = AdminService;
