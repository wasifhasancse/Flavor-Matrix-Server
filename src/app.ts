import express, { Request, Response } from "express";
import cors from "cors";
import { adminRouter } from "./routes/admin";
import { analyticsRouter } from "./routes/analytics";
import { bookmarksRouter } from "./routes/bookmarks";
import { interactionsRouter } from "./routes/interactions";
import { paymentsRouter } from "./routes/payments";
import { recipesRouter } from "./routes/recipes";

const app = express();

app.use(cors());
app.use(express.json());

// Mount modular routes at root level
app.use("/api/admin", adminRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/bookmarks", bookmarksRouter);
app.use("/api/interactions", interactionsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/recipes", recipesRouter);

// Base root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! Flavor Matrix Server is running.");
});

export default app;
