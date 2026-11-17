import { Router } from "express";

import {
  registerToken,
  unregisterToken,
} from "../controllers/notification.controller";

import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.post("/register-token", registerToken);
router.delete("/unregister-token", unregisterToken);

export default router;