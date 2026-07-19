import { Router } from "express";
import { verifyToken } from "../middlewares/auth";
import { streamChat } from "../controllers/chat.controller";

const router = Router();

// Protect this route so only authenticated users can use the AI chat
router.post("/", verifyToken, streamChat);

export default router;
