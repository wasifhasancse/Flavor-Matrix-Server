import { ObjectId } from "mongodb";
import { collections } from "../config/db";
import { RecipeDoc } from "../types/database";

export interface CreateRecipeInput {
  recipeName: string;
  recipeImage: string;
  category: string;
  cuisineType: string;
  difficultyLevel: "Easy" | "Medium" | "Hard";
  preparationTime: string;
  ingredients: string[];
  instructions: string[];
  authorId: string;
  authorName: string;
  authorEmail: string;
  price?: number;
  status?: "published" | "draft" | "pending" | "archived";
}

export class RecipeService {
  /**
   * Creates a new recipe following the required Database Architecture.
   * Enforces a 2-recipe limit for free (non-premium) users.
   */
  static async createRecipe(userId: string, input: CreateRecipeInput): Promise<RecipeDoc> {
    // 1. Fetch user to check premium status
    const user = await collections.users.findOne({ _id: new ObjectId(userId) });
    const isPremium = user?.isPremium || false;

    // 2. If user is free, enforce the 2-recipe creation limit
    if (!isPremium) {
      const createdCount = await collections.recipes.countDocuments({ authorId: userId });
      if (createdCount >= 2) {
        throw new Error("LIMIT_EXCEEDED");
      }
    }

    // 3. Save recipe document to MongoDB with database architecture schema
    const now = new Date();
    const doc: RecipeDoc = {
      recipeName: input.recipeName,
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
      status: input.status || "published",
      price: input.price ? Number(input.price) : undefined,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collections.recipes.insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  /**
   * Retrieves recipes with server-side pagination & MongoDB $in array category filtering.
   */
  static async getRecipes(query: { category?: string | string[]; categories?: string | string[]; page?: string; limit?: string; search?: string }) {
    const rawCategories = query.categories || query.category;
    let catList: string[] = [];

    if (Array.isArray(rawCategories)) {
      catList = rawCategories.map((c) => String(c).trim()).filter(Boolean);
    } else if (typeof rawCategories === "string") {
      catList = rawCategories.split(",").map((c) => c.trim()).filter(Boolean);
    }

    const filter: any = {};
    if (catList.length > 0) {
      filter.category = {
        $in: catList.map((cat) => new RegExp(`^${cat.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, "i")),
      };
    }

    if (query.search && typeof query.search === "string" && query.search.trim() !== "") {
      const regex = new RegExp(query.search.trim(), "i");
      filter.$or = [{ recipeName: regex }, { title: regex }, { authorName: regex }, { authorEmail: regex }];
    }

    const page = Math.max(1, Number(query.page || "1"));
    const limit = Math.max(1, Number(query.limit || "6"));
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await collections.recipes.aggregate(pipeline).toArray();
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
  static async getRecipeById(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new Error("INVALID_ID");
    }

    const recipe = await collections.recipes.findOne({ _id: new ObjectId(id) });
    if (!recipe) {
      throw new Error("NOT_FOUND");
    }

    return recipe;
  }

  /**
   * Updates a recipe if the user is the author or an admin.
   */
  static async updateRecipe(
    id: string,
    userId: string,
    role: string,
    updateData: Partial<CreateRecipeInput>
  ) {
    if (!ObjectId.isValid(id)) {
      throw new Error("INVALID_ID");
    }

    const recipe = await collections.recipes.findOne({ _id: new ObjectId(id) });
    if (!recipe) {
      throw new Error("NOT_FOUND");
    }

    if (recipe.authorId !== userId && role !== "admin") {
      throw new Error("UNAUTHORIZED");
    }

    const fieldsToSet: any = {};
    const allowedFields: Array<keyof CreateRecipeInput> = [
      "recipeName",
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

    await collections.recipes.updateOne({ _id: new ObjectId(id) }, { $set: fieldsToSet });

    return { ...recipe, ...fieldsToSet };
  }

  /**
   * Deletes a recipe if the user is the author or an admin.
   */
  static async deleteRecipe(id: string, userId: string, role: string) {
    if (!ObjectId.isValid(id)) {
      throw new Error("INVALID_ID");
    }

    const recipe = await collections.recipes.findOne({ _id: new ObjectId(id) });
    if (!recipe) {
      throw new Error("NOT_FOUND");
    }

    if (recipe.authorId !== userId && role !== "admin") {
      throw new Error("UNAUTHORIZED");
    }

    await collections.recipes.deleteOne({ _id: new ObjectId(id) });
    return { success: true };
  }
}
