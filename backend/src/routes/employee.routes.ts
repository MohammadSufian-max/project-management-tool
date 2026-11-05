import { Router } from "express";

import {
  getEmployees,
  getEmployee,
  addEmployee,
  editEmployee,
  removeEmployee,
  getTasksByEmployee,
} from "../controllers/employee.controller";

import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

// All employee routes require a valid token
router.use(authenticateToken);

// GET employee tasks (Employee + Super Admin)
router.get("/:id/tasks", getTasksByEmployee);

// Only Super Admin can access employee management APIs
router.use(authorizeRoles("Super Admin"));

// GET all employees
router.get("/", getEmployees);

// GET employee by ID
router.get("/:id", getEmployee);

// POST create employee
router.post("/", addEmployee);

// PUT update employee
router.put("/:id", editEmployee);

// DELETE employee
router.delete("/:id", removeEmployee);

export default router;