import { Router } from "express";
import {
  login,
  getCurrentUser,
} from "../controllers/auth.controller";

import { authenticateToken } from "../middleware/auth.middleware";


const router = Router();

// Login API
router.post("/login", login);

// Get logged-in user
router.get("/me", authenticateToken, getCurrentUser);

export default router;
