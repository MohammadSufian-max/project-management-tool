
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { AppDataSource } from "../config/database";
import { Employee } from "../entities/Employee";

const employeeRepository = AppDataSource.getRepository(Employee);

// Login service
export const loginUser = async (email: string, password: string) => {
  // Find employee and explicitly select password
  const employee = await employeeRepository
    .createQueryBuilder("employee")
    .addSelect("employee.password")
    .where("employee.email = :email", { email })
    .getOne();

  if (!employee) {
    throw new Error("Invalid email or password");
  }

  // Check account status
  if (employee.status !== "Active") {
    throw new Error("Your account is inactive");
  }

  if (!employee.password) {
    throw new Error("Invalid email or password");
  }

  // Compare password with bcrypt hash
  const isPasswordValid = await bcrypt.compare(
    
    password,
    employee.password
  );
 

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: employee.id,
      email: employee.email,
      role: employee.role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    }
  );

  return {
    token,
    user: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
    },
  };
};

// Change logged-in user's password
export const changeUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  // Find employee and explicitly select password
  const employee = await employeeRepository
    .createQueryBuilder("employee")
    .addSelect("employee.password")
    .where("employee.id = :id", { id: userId })
    .getOne();

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (!employee.password) {
    throw new Error("Current password is incorrect");
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    employee.password
  );

  if (!isPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
const testMatch = await bcrypt.compare(
  newPassword,
  hashedPassword
);

console.log("New password hash test:", testMatch);
  // Save new password
  employee.password = hashedPassword;

await employeeRepository.save(employee);

// Verify the saved password from database
const savedEmployee = await employeeRepository
  .createQueryBuilder("employee")
  .addSelect("employee.password")
  .where("employee.id = :id", { id: userId })
  .getOne();

const savedPasswordMatches = await bcrypt.compare(
  newPassword,
  savedEmployee?.password || ""
);

console.log("Password saved for employee:", userId);
console.log("Password persisted correctly:", savedPasswordMatches);

return true;
};
