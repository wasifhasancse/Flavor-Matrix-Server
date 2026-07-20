"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const recipes_1 = require("./routes/recipes");
const interactions_1 = require("./routes/interactions");
const payments_1 = require("./routes/payments");
const admin_1 = require("./routes/admin");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Global Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json({
    verify: (req, res, buf) => {
        if (req.originalUrl && req.originalUrl.startsWith("/api/payments/webhook")) {
            req.rawBody = buf;
        }
    },
}));
// Basic Health Check Route
app.get("/health", async (req, res) => {
    try {
        const db = (0, db_1.getDB)();
        // Ping DB to verify active connection
        await db.command({ ping: 1 });
        res.status(200).json({
            status: "OK",
            message: "Flavor Matrix API is running and connected to MongoDB.",
            timestamp: new Date(),
            uptime: process.uptime(),
        });
    }
    catch (error) {
        res.status(500).json({
            status: "ERROR",
            message: "Database connection ping failed.",
            error: error.message || error,
            timestamp: new Date(),
        });
    }
});
// Root Route Redirect
app.get("/", (req, res) => {
    res.status(200).json({
        name: "Flavor Matrix API",
        version: "1.0.0",
        docs: "/health"
    });
});
// Recipe CRUD Routes
app.use("/api/recipes", recipes_1.recipesRouter);
// Recipe Interactions Routes
app.use("/api/interactions", interactions_1.interactionsRouter);
// Stripe Payments Routes
app.use("/api/payments", payments_1.paymentsRouter);
// Administrative Controls & Stats
app.use("/api/admin", admin_1.adminRouter);
// Global Error Handler for Express 5
app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || "Internal Server Error",
        },
    });
});
// Connect to Database and start server listener
(0, db_1.connectDB)()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`[Server] running on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error("[Server] startup failed due to database connection error:", err);
    process.exit(1);
});
