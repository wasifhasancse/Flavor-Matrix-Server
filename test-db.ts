import "dotenv/config";
import { MongoClient } from "mongodb";

async function run() {
  const uri = "mongodb://pixgen:ko5VFkC2svjp0Esr@ac-gmu3ldl-shard-00-00.jjwy9ag.mongodb.net:27017,ac-gmu3ldl-shard-00-01.jjwy9ag.mongodb.net:27017,ac-gmu3ldl-shard-00-02.jjwy9ag.mongodb.net:27017/?ssl=true&replicaSet=atlas-1xvyf0-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";
  console.log("URI:", uri);

  const client = new MongoClient(uri);

  try {
    console.log("Connecting...");
    await client.connect();
    console.log("Connected!");
    const db = client.db(process.env.MONGODB_DATABASE_NAME || "Flavor-Matrix");
    const count = await db.collection("recipes").countDocuments();
    console.log("Recipes count:", count);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
