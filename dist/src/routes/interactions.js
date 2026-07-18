"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactionsRouter = void 0;
const express_1 = require("express");
const interaction_controller_1 = require("../controllers/interaction.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Protect all interaction routes with verifyToken middleware
router.use(auth_1.verifyToken);
router.post("/like", interaction_controller_1.InteractionController.likeRecipe);
router.post("/favorite", interaction_controller_1.InteractionController.toggleFavorite);
router.post("/report", interaction_controller_1.InteractionController.reportRecipe);
exports.interactionsRouter = router;
