import { Router } from "express";
import {
  fetchProfile,
  editProfile,
} from "../controllers/profile.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All profile routes require authentication
router.use(authenticateToken);

// GET logged-in user's profile
router.get("/", fetchProfile);

// PUT logged-in user's profile
router.put("/", editProfile);

export default router;