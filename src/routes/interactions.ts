import { Router } from "express";
import { InteractionController } from "../controllers/interaction.controller";
import { verifyToken } from "../middlewares/auth";

const router = Router();

// Protect all interaction routes with verifyToken middleware
router.use(verifyToken as any);

router.post("/like", InteractionController.likeRecipe);
router.post("/favorite", InteractionController.toggleFavorite);
router.post("/report", InteractionController.reportRecipe);

export const interactionsRouter = router;
