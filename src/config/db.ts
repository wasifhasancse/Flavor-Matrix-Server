import { MongoClient, Db, Collection } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/flavor-matrix";
const DB_NAME = MONGO_URI.split("/").pop()?.split("?")[0] || "flavor-matrix";

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Initializes and connects to the MongoDB instance.
 * Uses cached client if already connected.
 */
export async function connectDB(): Promise<Db> {
  if (db) return db;

  try {
    console.log("Connecting to MongoDB...");
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`Successfully connected to MongoDB database: "${DB_NAME}"`);
    return db;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

/**
 * Returns the active Db instance. Throws an error if connectDB has not been run.
 */
export function getDB(): Db {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return db;
}

/**
 * Closes the active MongoDB connection client.
 */
export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("MongoDB connection closed.");
  }
}

// Database collection getters for Schema requirements
export const collections = {
  get users(): Collection {
    return getDB().collection("users");
  },
  get recipes(): Collection {
    return getDB().collection("recipes");
  },
  get favorites(): Collection {
    return getDB().collection("favorites");
  },
  get reports(): Collection {
    return getDB().collection("reports");
  },
  get payments(): Collection {
    return getDB().collection("payments");
  }
};
