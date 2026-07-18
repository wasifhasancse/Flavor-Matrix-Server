import { MongoClient, ServerApiVersion, ObjectId, Db, Collection } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.warn("WARNING: MONGODB_URI is not defined in the environment.");
}

export const client = new MongoClient(uri || "mongodb://localhost:27017", {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const dbName = process.env.MONGODB_DATABASE_NAME || "flavor-matrix";
export const db: Db = client.db(dbName);

export const collections = {
  users: db.collection("users"),
  recipes: db.collection("recipes"),
  bookmarks: db.collection("bookmarks"),
  interactions: db.collection("interactions"),
  payments: db.collection("payments"),
  ratings: db.collection("ratings"),
  reports: db.collection("reports"),
  favorites: db.collection("favorites")
};

export { ObjectId };
