import { ObjectId } from "mongodb";
import { collections } from "../config/db";

export interface CreateRecipeInput {
  title: string;
  description: string;
  image: string;
  prepTime: string;
  cookTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  ingredients: string[];
  instructions: string[];
  price?: number;
  authorId: string;
  author: string;
}

export class RecipeService {
  /**
   * Creates a new recipe.
   * Enforces a 2-recipe limit for free (non-premium) users.
   */
  static async createRecipe(userId: string, input: CreateRecipeInput) {
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

    // 3. Save recipe to database
    const doc = {
      ...input,
      likes: 0,
      isFeatured: false,
      createdAt: new Date(),
    };

    const result = await collections.recipes.insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  /**
   * Retrieves recipes with server-side pagination and category filtering ($in).
   */
  static async getRecipes(query: { category?: string; page?: string; limit?: string }) {
    const filter: any = {};

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

    const list = await collections.recipes
      .find(filter)
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collections.recipes.countDocuments(filter);
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

    // Authorization check: Only author or admin can update
    if (recipe.authorId !== userId && role !== "admin") {
      throw new Error("UNAUTHORIZED");
    }

    const fieldsToSet: any = {};
    const allowedFields: Array<keyof CreateRecipeInput> = [
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

    // Authorization check: Only author or admin can delete
    if (recipe.authorId !== userId && role !== "admin") {
      throw new Error("UNAUTHORIZED");
    }

    await collections.recipes.deleteOne({ _id: new ObjectId(id) });
    return { success: true };
  }
}
