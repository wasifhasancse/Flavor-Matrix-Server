"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookmarksRouter = void 0;
const express_1 = require("express");
const bookmark_controller_1 = require("../controllers/bookmark.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Protect all bookmark routes with authentication
router.use(auth_1.verifyToken);
router.get("/", bookmark_controller_1.BookmarkController.getBookmarks);
router.post("/", bookmark_controller_1.BookmarkController.toggleBookmark);
router.delete("/:recipeId", bookmark_controller_1.BookmarkController.removeBookmark);
exports.bookmarksRouter = router;
