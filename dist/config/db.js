"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collections = void 0;
exports.connectDB = connectDB;
exports.getDB = getDB;
exports.closeDB = closeDB;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/flavor-matrix";
const DB_NAME = MONGO_URI.split("/").pop()?.split("?")[0] || "flavor-matrix";
let client = null;
let db = null;
/**
 * Initializes and connects to the MongoDB instance.
 * Uses cached client if already connected.
 */
async function connectDB() {
    if (db)
        return db;
    try {
        console.log("Connecting to MongoDB...");
        client = new mongodb_1.MongoClient(MONGO_URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log(`Successfully connected to MongoDB database: "${DB_NAME}"`);
        return db;
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
}
/**
 * Returns the active Db instance. Throws an error if connectDB has not been run.
 */
function getDB() {
    if (!db) {
        throw new Error("Database not initialized. Call connectDB() first.");
    }
    return db;
}
/**
 * Closes the active MongoDB connection client.
 */
async function closeDB() {
    if (client) {
        await client.close();
        client = null;
        db = null;
        console.log("MongoDB connection closed.");
    }
}
// Database collection getters for Schema requirements
exports.collections = {
    get users() {
        return getDB().collection("users");
    },
    get recipes() {
        return getDB().collection("recipes");
    },
    get favorites() {
        return getDB().collection("favorites");
    },
    get reports() {
        return getDB().collection("reports");
    },
    get payments() {
        return getDB().collection("payments");
    }
};
