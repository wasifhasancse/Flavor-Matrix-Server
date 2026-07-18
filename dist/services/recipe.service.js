"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeService = void 0;
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
class RecipeService {
    /**
     * Creates a new recipe.
     * Enforces a 2-recipe limit for free (non-premium) users.
     */
    static async createRecipe(userId, input) {
        // 1. Fetch user to check premium status
        const user = await db_1.collections.users.findOne({ _id: new mongodb_1.ObjectId(userId) });
        const isPremium = user?.isPremium || false;
        // 2. If user is free, enforce the 2-recipe creation limit
        if (!isPremium) {
            const createdCount = await db_1.collections.recipes.countDocuments({ authorId: userId });
            if (createdCount >= 2) {
                throw new Error("LIMIT_EXCEEDED");
            }
        }
        // 3. Save recipe to database
        const doc = {
            ...input,
            likes: 0,
            isFeatured: false,
            createdAt: new Date(),
        };
        const result = await db_1.collections.recipes.insertOne(doc);
        return { ...doc, _id: result.insertedId };
    }
    /**
     * Retrieves recipes with server-side pagination and category filtering ($in).
     */
    static async getRecipes(query) {
        const filter = {};
        // Category filtering utilizing $in
        if (query.category) {
            const catList = query.category.split(",").map((c) => c.trim()).filter((c) => c.length > 0);
            if (catList.length > 0) {
                filter.category = { $in: catList };
            }
        }
        const page = Math.max(1, Number(query.page || "1"));
        const limit = Math.max(1, Number(query.limit || "6"));
        const skip = (page - 1) * limit;
        const list = await db_1.collections.recipes
            .find(filter)
            .skip(skip)
            .limit(limit)
            .toArray();
        const total = await db_1.collections.recipes.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);
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
        // Authorization check: Only author or admin can update
        if (recipe.authorId !== userId && role !== "admin") {
            throw new Error("UNAUTHORIZED");
        }
        const fieldsToSet = {};
        const allowedFields = [
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
        ];
        allowedFields.forEach((field) => {
            if (updateData[field] !== undefined) {
                fieldsToSet[field] = updateData[field];
            }
        });
        fieldsToSet.updatedAt = new Date();
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
        // Authorization check: Only author or admin can delete
        if (recipe.authorId !== userId && role !== "admin") {
            throw new Error("UNAUTHORIZED");
        }
        await db_1.collections.recipes.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return { success: true };
    }
}
exports.RecipeService = RecipeService;
