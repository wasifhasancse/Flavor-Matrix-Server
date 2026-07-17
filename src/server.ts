import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, getDB } from "./config/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
app.use(cors());
app.use(express.json());

// Basic Health Check Route
app.get("/health", async (req: Request, res: Response) => {
  try {
    const db = getDB();
    // Ping DB to verify active connection
    await db.command({ ping: 1 });
    
    res.status(200).json({
      status: "OK",
      message: "Flavor Matrix API is running and connected to MongoDB.",
      timestamp: new Date(),
      uptime: process.uptime(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: "ERROR",
      message: "Database connection ping failed.",
      error: error.message || error,
      timestamp: new Date(),
    });
  }
});

// Root Route Redirect
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    name: "Flavor Matrix API",
    version: "1.0.0",
    docs: "/health"
  });
});

// Global Error Handler for Express 5
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Unhandled server error:", err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
});

// Connect to Database and start server listener
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[Server] startup failed due to database connection error:", err);
    process.exit(1);
  });
