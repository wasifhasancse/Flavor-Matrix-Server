import { ObjectId } from "mongodb";

/**
 * 1. User Database Schema Interface
 */
export interface UserDoc {
  _id?: ObjectId;
  name: string;
  email: string;
  image: string;
  role: "user" | "admin";
  isBlocked: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 2. Recipe Database Schema Interface
 */
export interface RecipeDoc {
  _id?: ObjectId;
  title: string;
  description: string;
  image: string;
  category: string;
  cuisineType: string;
  difficulty: "Easy" | "Medium" | "Hard";
  prepTime: string;
  cookTime: string;
  ingredients: string[];
  instructions: string[];
  authorId: string;
  author: string;
  authorEmail: string;
  likes: number;
  isFeatured: boolean;
  status: "published" | "draft" | "pending" | "archived";
  price?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 3. Favorite Database Schema Interface
 */
export interface FavoriteDoc {
  _id?: ObjectId;
  userEmail: string;
  userId: string;
  recipeId: string;
  addedAt: Date;
}

/**
 * 4. Report Database Schema Interface
 */
export interface ReportDoc {
  _id?: ObjectId;
  recipeId: string;
  reporterEmail: string;
  reason: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: Date;
}

/**
 * 5. Payment Database Schema Interface
 */
export interface PaymentDoc {
  _id?: ObjectId;
  userEmail: string;
  userId: string;
  amount: number;
  recipeId: string;
  transactionId: string;
  paymentStatus: "succeeded" | "failed" | "pending";
  paidAt: Date;
}
