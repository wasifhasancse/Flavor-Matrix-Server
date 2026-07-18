import { Router } from "express";
import { BookmarkController } from "../controllers/bookmark.controller";
import { verifyToken } from "../middlewares/auth";

const router = Router();

// Protect all bookmark routes with authentication
router.use(verifyToken as any);

router.get("/", BookmarkController.getBookmarks);
router.post("/", BookmarkController.toggleBookmark);
router.delete("/:recipeId", BookmarkController.removeBookmark);

export const bookmarksRouter = router;
