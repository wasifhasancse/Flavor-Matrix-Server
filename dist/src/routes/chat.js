"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const chat_controller_1 = require("../controllers/chat.controller");
const router = (0, express_1.Router)();
// Protect this route so only authenticated users can use the AI chat
router.post("/", auth_1.verifyToken, chat_controller_1.streamChat);
exports.default = router;
