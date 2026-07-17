import { Request, Response } from "express";
import { PaymentService } from "../services/payment.service";

export class PaymentController {
  /**
   * Creates a Checkout Session for Premium membership.
   */
  static async createMembershipSession(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { successUrl, cancelUrl } = req.body;

      if (!user) {
        res.status(401).json({ error: "Unauthorized. User session not found." });
        return;
      }

      if (!successUrl || !cancelUrl) {
        res.status(400).json({ error: "Missing redirect URLs (successUrl, cancelUrl) in request body." });
        return;
      }

      const sessionUrl = await PaymentService.createMembershipSession(user.id, successUrl, cancelUrl);
      res.status(200).json({ url: sessionUrl });
    } catch (error: any) {
      if (error.message === "INVALID_USER_ID") {
        res.status(400).json({ error: "Invalid user ID format." });
        return;
      }
      if (error.message === "USER_NOT_FOUND") {
        res.status(404).json({ error: "User profile not found." });
        return;
      }

      console.error("Create Membership Session Controller Error:", error);
      res.status(500).json({ error: "Internal server error while creating checkout session." });
    }
  }

  /**
   * Creates a Checkout Session for buying an individual recipe.
   */
  static async createRecipeSession(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { recipeId, successUrl, cancelUrl } = req.body;

      if (!user) {
        res.status(401).json({ error: "Unauthorized. User session not found." });
        return;
      }

      if (!recipeId) {
        res.status(400).json({ error: "Missing recipeId in request body." });
        return;
      }

      if (!successUrl || !cancelUrl) {
        res.status(400).json({ error: "Missing redirect URLs (successUrl, cancelUrl) in request body." });
        return;
      }

      const sessionUrl = await PaymentService.createRecipeSession(user.id, recipeId, successUrl, cancelUrl);
      res.status(200).json({ url: sessionUrl });
    } catch (error: any) {
      if (error.message === "INVALID_USER_ID" || error.message === "INVALID_RECIPE_ID") {
        res.status(400).json({ error: "Invalid identifier format." });
        return;
      }
      if (error.message === "USER_NOT_FOUND") {
        res.status(404).json({ error: "User profile not found." });
        return;
      }
      if (error.message === "RECIPE_NOT_FOUND") {
        res.status(404).json({ error: "Recipe not found." });
        return;
      }
      if (error.message === "RECIPE_NOT_PREMIUM") {
        res.status(400).json({ error: "This recipe is free and does not require purchase." });
        return;
      }

      console.error("Create Recipe Session Controller Error:", error);
      res.status(500).json({ error: "Internal server error while creating checkout session." });
    }
  }

  /**
   * Receives Stripe webhook events and triggers DB callbacks.
   */
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers["stripe-signature"];
    const rawBody = req.rawBody;

    if (!sig || !rawBody) {
      res.status(400).json({ error: "Stripe signature or raw request body is missing." });
      return;
    }

    try {
      await PaymentService.handleWebhook(rawBody, sig as string);
      res.status(200).json({ received: true });
    } catch (error: any) {
      if (error.message === "SIGNATURE_VERIFICATION_FAILED") {
        res.status(400).json({ error: "Invalid Stripe Webhook signature." });
        return;
      }
      
      console.error("Stripe Webhook Controller Error:", error);
      res.status(500).json({ error: "Internal server error during webhook verification." });
    }
  }
}
