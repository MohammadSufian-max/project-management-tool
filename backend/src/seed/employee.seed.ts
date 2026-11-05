import bcrypt from "bcrypt";
import { AppDataSource } from "../config/database";
import { Employee } from "../entities/Employee";

export const seedEmployee = async () => {
  const employeeRepository = AppDataSource.getRepository(Employee);

  // Check whether demo employee already exists
  const existingEmployee = await employeeRepository.findOne({
    where: {
      email: "employee@demo.com",
    },
  });

  if (existingEmployee) {
    console.log("Demo Employee already exists");
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash("Employee@123", 10);

  // Create demo employee
  const employee = employeeRepository.create({
    id: "employee-001",
    name: "Demo Employee",
    email: "employee@demo.com",
    password: hashedPassword,
    role: "Employee",
    phone: "8888888888",
    designation: "Software Developer",
    department: "Engineering",
    joiningDate: "2026-11-04",
    status: "Active",
  });

  await employeeRepository.save(employee);

  console.log("Demo Employee created successfully");
};