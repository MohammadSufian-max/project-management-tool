import { Router } from "express";

import {
  getProjects,
  getProject,
  addProject,
  editProject,
  removeProject,
  getTasksByProject,
  getTeamByProject,
} from "../controllers/project.controller";

import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

// All project routes require a valid token
router.use(authenticateToken);

// GET routes (authenticated users)
router.get("/", getProjects);
router.get("/:id/team", getTeamByProject);
router.get("/:id", getProject);
router.get("/:id/tasks", getTasksByProject);

// Only Super Admin can manage projects
router.use(authorizeRoles("Super Admin"));

// POST create project
router.post("/", addProject);

// PUT update project
router.put("/:id", editProject);

// DELETE project
router.delete("/:id", removeProject);

export default router;