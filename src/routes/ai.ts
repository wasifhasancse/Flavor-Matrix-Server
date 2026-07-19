import { Router } from "express";
import { verifyToken } from "../middlewares/auth";
import { analyzeFoodImage } from "../controllers/ai.controller";

const router = Router();

// Protect this route so only authenticated users can use the AI feature
router.post("/analyze-image", verifyToken, analyzeFoodImage);

export default router;
