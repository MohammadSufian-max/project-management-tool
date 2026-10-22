
import type { Task } from "../types";

export const mockTasks: Task[] = [
  {
    id: "task-001",
    title: "Build Product Listing Page",
    description:
      "Create a responsive product listing page with product cards and filters.",
    projectId: "proj-001",
    assigneeId: "emp-003",
    priority: "High",
    status: "In Progress",
    startDate: "2026-10-01",
    dueDate: "2026-10-25",
    createdAt: "2026-10-01T09:00:00.000Z",
  },
  {
    id: "task-002",
    title: "Design Shopping Cart",
    description:
      "Design the shopping cart interface and its empty state.",
    projectId: "proj-001",
    assigneeId: "emp-004",
    priority: "Medium",
    status: "To Do",
    startDate: "2026-10-05",
    dueDate: "2026-10-28",
    createdAt: "2026-10-05T09:00:00.000Z",
  },
  {
    id: "task-003",
    title: "Create Employee Table",
    description:
      "Build the employee table with columns for name, email, role, and status.",
    projectId: "proj-002",
    assigneeId: "emp-003",
    priority: "High",
    status: "Done",
    startDate: "2026-10-02",
    dueDate: "2026-10-12",
    createdAt: "2026-10-02T09:00:00.000Z",
  },
  {
    id: "task-004",
    title: "Test Employee Forms",
    description:
      "Test employee form validation and required field messages.",
    projectId: "proj-002",
    assigneeId: "emp-005",
    priority: "Low",
    status: "To Do",
    startDate: "2026-10-15",
    dueDate: "2026-10-30",
    createdAt: "2026-10-15T09:00:00.000Z",
  },
];
