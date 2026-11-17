
import { Router } from "express";

import { registerToken } from "../controllers/notification.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.post("/register-token", registerToken);

export default router;
