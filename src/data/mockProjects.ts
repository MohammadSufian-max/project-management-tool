
import type { Project } from "../types";

export const mockProjects: Project[] = [
  {
    id: "proj-001",
    name: "E-Commerce Website",
    description:
      "Build a responsive e-commerce website with product listings and cart functionality.",
    projectManagerId: "emp-002",
    teamMemberIds: ["emp-003", "emp-004"],
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "In Progress",
    createdAt: "2026-01-01T09:00:00.000Z",
  },
  {
    id: "proj-002",
    name: "Employee Management System",
    description:
      "Develop an internal system to manage employee records and project assignments.",
    projectManagerId: "emp-002",
    teamMemberIds: ["emp-003", "emp-005"],
    startDate: "2026-02-01",
    endDate: "2026-11-30",
    status: "In Progress",
    createdAt: "2026-02-01T09:00:00.000Z",
  },
];
