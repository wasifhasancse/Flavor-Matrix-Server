import { ObjectId } from "mongodb";
import Stripe from "stripe";
import { collections } from "../config/db";
import { PaymentDoc } from "../types/database";

const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
const STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder";

const stripe = new Stripe(STRIPE_SECRET_KEY);

export class PaymentService {
  /**
   * Creates a Checkout Session for upgrading a user to Premium.
   */
  static async createMembershipSession(
    userId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<string> {
    if (!ObjectId.isValid(userId)) {
      throw new Error("INVALID_USER_ID");
    }

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
              description:
                "Unlimited recipe creation and exclusive access on Flavor Matrix.",
            },
            unit_amount: 1999, // $19.99
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        type: "membership_upgrade",
        userId,
        userEmail: user.email,
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
    cancelUrl: string,
  ): Promise<string> {
    if (!ObjectId.isValid(userId)) {
      throw new Error("INVALID_USER_ID");
    }
    if (!ObjectId.isValid(recipeId)) {
      throw new Error("INVALID_RECIPE_ID");
    }

    const user = await collections.users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const recipe = await collections.recipes.findOne({
      _id: new ObjectId(recipeId),
    });
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
              name: `Recipe: ${recipe.recipeName || recipe.title}`,
              description: `Purchase access to premium recipe instructions.`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        type: "recipe_purchase",
        userId,
        userEmail: user.email,
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
   * Handles secure Stripe webhooks and records successful payment documents.
   * Follows Payment Schema: userEmail, userId, amount, recipeId, transactionId, paymentStatus, paidAt.
   */
  static async handleWebhook(
    rawBody: Buffer,
    signature: string,
  ): Promise<void> {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        STRIPE_WEBHOOK_SECRET,
      );
    } catch (err: any) {
      console.error(
        `[Stripe Webhook Error] Signature verification failed:`,
        err.message,
      );
      throw new Error("SIGNATURE_VERIFICATION_FAILED");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (!metadata) {
        console.warn("Stripe Checkout Session completed with empty metadata.");
        return;
      }

      const { type, userId, userEmail, recipeId } = metadata;
      const now = new Date();

      if (type === "membership_upgrade" && userId) {
        // Upgrade user status in 'users' collection
        console.log(
          `[Stripe Webhook] Upgrading user ${userId} to Premium status.`,
        );
        await collections.users.updateOne(
          { _id: new ObjectId(userId) },
          { $set: { isPremium: true, updatedAt: now } },
        );

        // Record payment in 'payments' collection according to database architecture
        const paymentDoc: PaymentDoc = {
          userEmail:
            userEmail ||
            session.customer_details?.email ||
            "unknown@example.com",
          userId,
          amount: (session.amount_total || 0) / 100,
          recipeId: "MEMBERSHIP_UPGRADE",
          transactionId: session.id,
          paymentStatus: "succeeded",
          paidAt: now,
        };
        await collections.payments.insertOne(paymentDoc);
      } else if (type === "recipe_purchase" && userId && recipeId) {
        // Record payment in 'payments' collection according to database architecture
        console.log(
          `[Stripe Webhook] Logging recipe payment ${recipeId} for user ${userId}.`,
        );
        const paymentDoc: PaymentDoc = {
          userEmail:
            userEmail ||
            session.customer_details?.email ||
            "unknown@example.com",
          userId,
          amount: (session.amount_total || 0) / 100,
          recipeId,
          transactionId: session.id,
          paymentStatus: "succeeded",
          paidAt: now,
        };
        await collections.payments.insertOne(paymentDoc);
      }
    }
  }
}
