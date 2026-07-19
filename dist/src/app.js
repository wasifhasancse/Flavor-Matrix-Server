"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const admin_1 = require("./routes/admin");
const analytics_1 = require("./routes/analytics");
const bookmarks_1 = require("./routes/bookmarks");
const interactions_1 = require("./routes/interactions");
const payments_1 = require("./routes/payments");
const recipes_1 = require("./routes/recipes");
const categories_1 = require("./routes/categories");
const ai_1 = __importDefault(require("./routes/ai"));
const chat_1 = __importDefault(require("./routes/chat"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Mount modular routes at root level
app.use("/api/admin", admin_1.adminRouter);
app.use("/api/analytics", analytics_1.analyticsRouter);
app.use("/api/bookmarks", bookmarks_1.bookmarksRouter);
app.use("/api/interactions", interactions_1.interactionsRouter);
app.use("/api/payments", payments_1.paymentsRouter);
app.use("/api/recipes", recipes_1.recipesRouter);
app.use("/api/categories", categories_1.categoriesRouter);
app.use("/api/ai", ai_1.default);
app.use("/api/ai/chat", chat_1.default);
// Base root endpoint
app.get("/", (req, res) => {
    res.send("Hello World! Flavor Matrix Server is running.");
});
exports.default = app;
// Trigger nodemon restart
