"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const ai_controller_1 = require("../controllers/ai.controller");
const router = (0, express_1.Router)();
// Protect this route so only authenticated users can use the AI feature
router.post("/analyze-image", auth_1.verifyToken, ai_controller_1.analyzeFoodImage);
exports.default = router;
