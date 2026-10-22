
import type { DemoUser } from "../types";

export const mockUsers: DemoUser[] = [
  {
    id: "user-admin",
    email: "admin@demo.com",
    password: "Admin@123",
    role: "Super Admin",
  },
  {
    id: "user-employee",
    email: "employee@demo.com",
    password: "Employee@123",
    role: "Employee",
    employeeId: "emp-003",
  },
];
