import Stripe from "stripe";
import { ObjectId } from "mongodb";
import { collections } from "../config/db";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder";

const stripe = new Stripe(STRIPE_SECRET_KEY);

export class PaymentService {
  /**
   * Creates a Checkout Session for upgrading a user to Premium Membership.
   */
  static async createMembershipSession(userId: string, successUrl: string, cancelUrl: string): Promise<string> {
    if (!ObjectId.isValid(userId)) {
      throw new Error("INVALID_USER_ID");
    }

    // Confirm user exists
    const user = await collections.users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Lifetime Premium Membership",
              description: "Unlimited recipe publishing and exclusive recipe access on Flavor Matrix.",
            },
            unit_amount: 1999, // $19.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        type: "membership_upgrade",
        userId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      throw new Error("STRIPE_SESSION_FAILED");
    }

    return session.url;
  }

  /**
   * Creates a Checkout Session for purchasing a premium recipe.
   */
  static async createRecipeSession(
    userId: string,
    recipeId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    if (!ObjectId.isValid(userId)) {
      throw new Error("INVALID_USER_ID");
    }
    if (!ObjectId.isValid(recipeId)) {
      throw new Error("INVALID_RECIPE_ID");
    }

    // Confirm user exists
    const user = await collections.users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Confirm recipe exists and requires purchasing
    const recipe = await collections.recipes.findOne({ _id: new ObjectId(recipeId) });
    if (!recipe) {
      throw new Error("RECIPE_NOT_FOUND");
    }

    const price = recipe.price || 0;
    if (price <= 0) {
      throw new Error("RECIPE_NOT_PREMIUM");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Recipe: ${recipe.title}`,
              description: `Purchase access to premium recipe instructions.`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        type: "recipe_purchase",
        userId,
        recipeId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      throw new Error("STRIPE_SESSION_FAILED");
    }

    return session.url;
  }

  /**
   * Handles secure Stripe webhooks.
   */
  static async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error(`[Stripe Webhook Error] Signature verification failed:`, err.message);
      throw new Error("SIGNATURE_VERIFICATION_FAILED");
    }

    // Capture checkout session completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (!metadata) {
        console.warn("Stripe Checkout Session completed with empty metadata.");
        return;
      }

      const { type, userId, recipeId } = metadata;

      if (type === "membership_upgrade" && userId) {
        // Upgrade user status in 'users' collection
        console.log(`[Stripe Webhook] Upgrading user ${userId} to Premium status.`);
        await collections.users.updateOne(
          { _id: new ObjectId(userId) },
          { $set: { isPremium: true, updatedAt: new Date() } }
        );
      } else if (type === "recipe_purchase" && userId && recipeId) {
        // Log transaction in 'payments' collection
        console.log(`[Stripe Webhook] Logging payment of recipe ${recipeId} for user ${userId}.`);
        await collections.payments.insertOne({
          userId,
          recipeId,
          amount: (session.amount_total || 0) / 100, // back to USD
          currency: session.currency || "usd",
          transactionId: session.id,
          status: "completed",
          createdAt: new Date(),
        });
      } else {
        console.warn(`[Stripe Webhook] Unrecognized checkout metadata combination:`, metadata);
      }
    }
  }
}
