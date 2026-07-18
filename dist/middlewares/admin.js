"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCheck = adminCheck;
/**
 * Middleware that restricts route access to administrators.
 * Expects verifyToken middleware to have populated req.user.
 */
function adminCheck(req, res, next) {
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
