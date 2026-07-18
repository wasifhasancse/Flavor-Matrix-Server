"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsRouter = void 0;
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Public Webhook route - Must be public for Stripe to ping it directly
router.post("/webhook", payment_controller_1.PaymentController.handleWebhook);
// Protected routes (Authentication Required)
router.post("/checkout/membership", auth_1.verifyToken, payment_controller_1.PaymentController.createMembershipSession);
router.post("/checkout/recipe", auth_1.verifyToken, payment_controller_1.PaymentController.createRecipeSession);
exports.paymentsRouter = router;
