
import { Router } from "express";

import {
  login,
  getCurrentUser,
  changePassword,
} from "../controllers/auth.controller";

import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Login API
router.post("/login", login);

// Get logged-in user
router.get("/me", authenticateToken, getCurrentUser);

// Change logged-in user's password
router.put("/change-password", authenticateToken, changePassword);

export default router;
