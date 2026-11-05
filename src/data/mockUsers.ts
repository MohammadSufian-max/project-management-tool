import type { DemoUser } from "../types";

export const mockUsers: DemoUser[] = [
  {
    id: "user-admin",
    name: "Super Admin",
    email: "admin@demo.com",
    password: "Admin@123",
    role: "Super Admin",
  },
  {
    id: "user-employee",
    name: "Demo Employee",
    email: "employee@demo.com",
    password: "Employee@123",
    role: "Employee",
    employeeId: "emp-003",
  },
];