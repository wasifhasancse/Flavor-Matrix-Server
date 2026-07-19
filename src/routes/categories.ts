import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";

const router = Router();

// Public route to fetch all categories
router.get("/", AdminController.listCategories);

export const categoriesRouter = router;
