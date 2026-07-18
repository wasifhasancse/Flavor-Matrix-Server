// Extends the Express Request interface globally so that req.user and req.rawBody
// are recognized by TypeScript throughout all controllers and middlewares.
import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: "admin" | "user";
    };
    rawBody?: Buffer;
  }
}
