import bcrypt from "bcrypt";
import { AppDataSource } from "../config/database";
import { Employee } from "../entities/Employee";

export const seedAdmin = async () => {
  const employeeRepository = AppDataSource.getRepository(Employee);

  const existingAdmin = await employeeRepository.findOne({
    where: {
      email: "admin@demo.com",
    },
  });

  if (existingAdmin) {
    console.log("Super Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const admin = employeeRepository.create({
    id: "admin-001",
    name: "Super Admin",
    email: "admin@demo.com",
    password: hashedPassword,
    role: "Super Admin",
    phone: "9999999999",
    designation: "System Administrator",
    department: "Other",
    joiningDate: "2026-11-04",
    status: "Active",
  });

  await employeeRepository.save(admin);

  console.log("Super Admin created successfully");
};