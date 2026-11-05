import { Router } from "express";

import {
  getTasks,
  getTask,
  addTask,
  editTask,
  removeTask,
} from "../controllers/task.controller";

import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

// GET routes: authenticated users
router.get("/", getTasks);
router.get("/:id", getTask);

// POST: Only Super Admin can create tasks
router.post("/", authorizeRoles("Super Admin"), addTask);

// PUT: Authenticated users
// Controller will enforce Employee's own-task status-only permission
router.put("/:id", editTask);

// DELETE: Only Super Admin can delete tasks
router.delete("/:id", authorizeRoles("Super Admin"), removeTask);

export default router;