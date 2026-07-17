import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { verifyToken } from "../middlewares/auth";

const router = Router();

// Public Webhook route - Must be public for Stripe to ping it directly
router.post("/webhook", PaymentController.handleWebhook);

// Protected routes (Authentication Required)
router.post("/checkout/membership", verifyToken as any, PaymentController.createMembershipSession);
router.post("/checkout/recipe", verifyToken as any, PaymentController.createRecipeSession);

export const paymentsRouter = router;
