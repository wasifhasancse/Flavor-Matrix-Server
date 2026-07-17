import { Request, Response, NextFunction } from "express";

/**
 * Middleware that restricts route access to administrators.
 * Expects verifyToken middleware to have populated req.user.
 */
export function adminCheck(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized. User session not found." });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Forbidden. Administrative privileges required." });
    return;
  }

  next();
}
