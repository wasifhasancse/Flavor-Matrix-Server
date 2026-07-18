"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkController = void 0;
const bookmark_service_1 = require("../services/bookmark.service");
class BookmarkController {
    /**
     * POST /api/bookmarks - Toggle bookmark status for a recipe.
     */
    static async toggleBookmark(req, res) {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: "Unauthorized. User session required." });
                return;
            }
            const { recipeId } = req.body;
            if (!recipeId) {
                res.status(400).json({ error: "Missing required parameter: recipeId." });
                return;
            }
            const result = await bookmark_service_1.BookmarkService.toggleBookmark(user.id, user.email, recipeId);
            res.status(200).json(result);
        }
        catch (error) {
            console.error("Toggle Bookmark Error:", error);
            res.status(500).json({ error: "Internal server error while processing bookmark." });
        }
    }
    /**
     * GET /api/bookmarks - List user's bookmarked recipes.
     */
    static async getBookmarks(req, res) {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: "Unauthorized. User session required." });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const data = await bookmark_service_1.BookmarkService.getBookmarks(user.id, page, limit);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Get Bookmarks Error:", error);
            res.status(500).json({ error: "Internal server error while fetching bookmarks." });
        }
    }
    /**
     * DELETE /api/bookmarks/:recipeId - Remove a bookmark by recipe ID.
     */
    static async removeBookmark(req, res) {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: "Unauthorized. User session required." });
                return;
            }
            const recipeId = req.params.recipeId;
            const result = await bookmark_service_1.BookmarkService.removeBookmark(user.id, recipeId);
            res.status(200).json(result);
        }
        catch (error) {
            console.error("Remove Bookmark Error:", error);
            res.status(500).json({ error: "Internal server error while removing bookmark." });
        }
    }
}
exports.BookmarkController = BookmarkController;
