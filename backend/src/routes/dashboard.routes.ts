import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// GET dashboard data
router.get("/", getDashboard);

export default router;