"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeService = void 0;
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
class RecipeService {
    /**
     * Creates a new recipe following the required Database Architecture.
     * Enforces a 2-recipe limit for free (non-premium) users.
     */
    static async createRecipe(userId, input) {
        // 1. Fetch user to get their explicit subscription logic
        const user = await db_1.collections.users.findOne({ _id: new mongodb_1.ObjectId(userId) });
        if (!user) {
            throw new Error("USER_NOT_FOUND");
        }
        const now = new Date();
        // Lookup active subscription specifically (just like frontend API)
        const activeSub = await db_1.collections.subscriptions.findOne({ userId, status: "active", endDate: { $gt: now } }, { sort: { createdAt: -1 } });
        const plan = activeSub?.plan || "free";
        // 2. Enforce limits based on the actual plan
        if (plan === "free") {
            const createdCount = await db_1.collections.recipes.countDocuments({
                authorId: userId,
            });
            if (createdCount >= 2) {
                throw new Error("LIMIT_EXCEEDED_FREE");
            }
        }
        else if (plan === "pro") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const createdCount = await db_1.collections.recipes.countDocuments({
                authorId: userId,
                createdAt: { $gte: startOfMonth },
            });
            if (createdCount >= 10) {
                throw new Error("LIMIT_EXCEEDED_PRO");
            }
        }
        // "premium" plan is unlimited, so no else block needed.
        // 3. Save recipe document to MongoDB with database architecture schema
        const normalizedStatus = input.status || (input.price && input.price > 0 ? "premium" : "free");
        const doc = {
            recipeName: input.recipeName,
            description: input.description || "",
            recipeImage: input.recipeImage,
            category: input.category,
            cuisineType: input.cuisineType || "International",
            difficultyLevel: input.difficultyLevel || "Easy",
            preparationTime: input.preparationTime || "15 mins",
            ingredients: input.ingredients,
            instructions: input.instructions,
            authorId: input.authorId,
            authorName: input.authorName,
            authorEmail: input.authorEmail,
            likesCount: 0,
            isFeatured: false,
            status: normalizedStatus,
            price: input.price ? Number(input.price) : undefined,
            createdAt: now,
            updatedAt: now,
            title: input.recipeName,
            image: input.recipeImage,
            difficulty: input.difficultyLevel || "Easy",
            prepTime: input.preparationTime || "15 mins",
            cookTime: "20 mins",
            author: input.authorName,
            likes: 0,
        };
        const result = await db_1.collections.recipes.insertOne(doc);
        return { ...doc, _id: result.insertedId };
    }
    /**
     * Retrieves recipes with server-side pagination & MongoDB $in array category filtering.
     */
    static async getRecipes(query) {
        const rawCategories = query.categories || query.category;
        let catList = [];
        const matchConditions = [];
        if (Array.isArray(rawCategories)) {
            catList = rawCategories.map((c) => String(c).trim()).filter(Boolean);
        }
        else if (typeof rawCategories === "string") {
            catList = rawCategories
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean);
        }
        if (catList.length > 0 && catList[0].toLowerCase() !== "all") {
            matchConditions.push({
                category: {
                    $in: catList.map((cat) => new RegExp(`^${cat.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, "i")),
                },
            });
        }
        if (query.difficultyLevel &&
            query.difficultyLevel.toLowerCase() !== "all") {
            matchConditions.push({
                $or: [
                    { difficultyLevel: query.difficultyLevel },
                    { difficulty: query.difficultyLevel },
                ],
            });
        }
        if (query.search &&
            typeof query.search === "string" &&
            query.search.trim() !== "") {
            const regex = new RegExp(query.search.trim(), "i");
            matchConditions.push({
                $or: [
                    { recipeName: regex },
                    { title: regex },
                    { authorName: regex },
                    { author: regex },
                    { authorEmail: regex },
                ],
            });
        }
        if (query.authorId) {
            matchConditions.push({ authorId: query.authorId });
        }
        const filter = matchConditions.length > 0 ? { $and: matchConditions } : {};
        const page = Math.max(1, Number(query.page || "1"));
        const limit = Math.max(1, Number(query.limit || "6"));
        const skip = (page - 1) * limit;
        const sortConfig = {};
        if (query.sortBy === "likesCount" || query.sortBy === "likes") {
            sortConfig.likesCount = query.sortOrder === "asc" ? 1 : -1;
        }
        else if (query.sortBy === "title" || query.sortBy === "recipeName") {
            sortConfig.recipeName = query.sortOrder === "desc" ? -1 : 1;
        }
        else {
            // Default to createdAt desc (newest)
            sortConfig.createdAt = query.sortOrder === "asc" ? 1 : -1;
        }
        const pipeline = [
            { $match: filter },
            { $sort: sortConfig },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{ $count: "count" }],
                },
            },
        ];
        const result = await db_1.collections.recipes.aggregate(pipeline).toArray();
        const facet = result[0] || { data: [], totalCount: [] };
        const list = facet.data || [];
        const total = facet.totalCount[0]?.count || 0;
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            recipes: list,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
        };
    }
    /**
     * Fetches a single recipe by its hex ID string.
     */
    static async getRecipeById(id) {
        if (!mongodb_1.ObjectId.isValid(id)) {
            throw new Error("INVALID_ID");
        }
        const recipe = await db_1.collections.recipes.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!recipe) {
            throw new Error("NOT_FOUND");
        }
        return recipe;
    }
    /**
     * Updates a recipe if the user is the author or an admin.
     */
    static async updateRecipe(id, userId, role, updateData) {
        if (!mongodb_1.ObjectId.isValid(id)) {
            throw new Error("INVALID_ID");
        }
        const recipe = await db_1.collections.recipes.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!recipe) {
            throw new Error("NOT_FOUND");
        }
        if (recipe.authorId !== userId && role !== "admin") {
            throw new Error("UNAUTHORIZED");
        }
        const fieldsToSet = {};
        const allowedFields = [
            "recipeName",
            "description",
            "recipeImage",
            "category",
            "cuisineType",
            "difficultyLevel",
            "preparationTime",
            "ingredients",
            "instructions",
            "price",
            "status",
        ];
        allowedFields.forEach((field) => {
            if (updateData[field] !== undefined) {
                fieldsToSet[field] = updateData[field];
            }
        });
        fieldsToSet.updatedAt = new Date();
        if (fieldsToSet.recipeName !== undefined)
            fieldsToSet.title = fieldsToSet.recipeName;
        if (fieldsToSet.recipeImage !== undefined)
            fieldsToSet.image = fieldsToSet.recipeImage;
        if (fieldsToSet.difficultyLevel !== undefined)
            fieldsToSet.difficulty = fieldsToSet.difficultyLevel;
        if (fieldsToSet.preparationTime !== undefined)
            fieldsToSet.prepTime = fieldsToSet.preparationTime;
        fieldsToSet.author = recipe.authorName;
        await db_1.collections.recipes.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: fieldsToSet });
        return { ...recipe, ...fieldsToSet };
    }
    /**
     * Deletes a recipe if the user is the author or an admin.
     */
    static async deleteRecipe(id, userId, role) {
        if (!mongodb_1.ObjectId.isValid(id)) {
            throw new Error("INVALID_ID");
        }
        const recipe = await db_1.collections.recipes.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!recipe) {
            throw new Error("NOT_FOUND");
        }
        if (recipe.authorId !== userId && role !== "admin") {
            throw new Error("UNAUTHORIZED");
        }
        await db_1.collections.recipes.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return { success: true };
    }
}
exports.RecipeService = RecipeService;
