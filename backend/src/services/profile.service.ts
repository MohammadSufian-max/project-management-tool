import { AppDataSource } from "../config/database";
import { Employee } from "../entities/Employee";

const employeeRepository = AppDataSource.getRepository(Employee);

// GET: Get logged-in user's profile
export const getProfile = async (userId: string) => {
  const employee = await employeeRepository.findOne({
    where: { id: userId },
  });

  if (!employee) {
    return null;
  }

  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    role: employee.role,
    designation: employee.designation,
    department: employee.department,
    joiningDate: employee.joiningDate,
  };
};

// PUT: Update logged-in user's profile
export const updateProfile = async (
  userId: string,
  data: { name?: string; phone?: string }
) => {
  const employee = await employeeRepository.findOne({
    where: { id: userId },
  });

  if (!employee) {
    return null;
  }

  // Validate name
  if (data.name !== undefined) {
    const name = data.name.trim();

    if (name.length < 3 || name.length > 100) {
      throw new Error("Name must be between 3 and 100 characters");
    }

    employee.name = name;
  }

  // Validate phone
  if (data.phone !== undefined) {
    if (!/^[0-9]{10}$/.test(data.phone)) {
      throw new Error("Invalid phone number");
    }

    employee.phone = data.phone;
  }

  const updatedEmployee = await employeeRepository.save(employee);

  return {
    id: updatedEmployee.id,
    name: updatedEmployee.name,
    email: updatedEmployee.email,
    phone: updatedEmployee.phone,
    role: updatedEmployee.role,
    designation: updatedEmployee.designation,
    department: updatedEmployee.department,
    joiningDate: updatedEmployee.joiningDate,
  };
};