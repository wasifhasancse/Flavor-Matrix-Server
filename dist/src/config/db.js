"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectId = exports.collections = exports.db = exports.client = void 0;
const mongodb_1 = require("mongodb");
Object.defineProperty(exports, "ObjectId", { enumerable: true, get: function () { return mongodb_1.ObjectId; } });
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.warn("WARNING: MONGODB_URI is not defined in the environment.");
}
exports.client = new mongodb_1.MongoClient(uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
const dbName = process.env.MONGODB_DATABASE_NAME || "flavor-matrix";
exports.db = exports.client.db(dbName);
exports.collections = {
    users: exports.db.collection("users"),
    recipes: exports.db.collection("recipes"),
    bookmarks: exports.db.collection("bookmarks"),
    interactions: exports.db.collection("interactions"),
    payments: exports.db.collection("payments"),
    ratings: exports.db.collection("ratings"),
    reports: exports.db.collection("reports"),
    favorites: exports.db.collection("favorites"),
    withdrawals: exports.db.collection("withdrawals"),
    categories: exports.db.collection("categories"),
    broadcasts: exports.db.collection("broadcasts"),
    subscriptions: exports.db.collection("subscriptions"),
};
