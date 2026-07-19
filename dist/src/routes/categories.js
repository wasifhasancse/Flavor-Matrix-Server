"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRouter = void 0;
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// Public route to fetch all categories
router.get("/", admin_controller_1.AdminController.listCategories);
exports.categoriesRouter = router;
