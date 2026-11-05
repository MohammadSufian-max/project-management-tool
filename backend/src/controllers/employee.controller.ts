
import { Request, Response } from "express";

import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeTasks,
} from "../services/employee.service";

// GET all employees
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await getAllEmployees();

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
    });
  }
};

// GET employee by ID
export const getEmployee = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const employee = await getEmployeeById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
    });
  }
};


// POST create employee
export const addEmployee = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      role,
      phone,
      designation,
      department,
      joiningDate,
      status,
    } = req.body || {};

    if (
      !name ||
      !email ||
      !role ||
      !phone ||
      !designation ||
      !department ||
      !joiningDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!["Employee", "Project Manager"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee role",
      });
    }

    const employee = await createEmployee({
      name,
      email,
      role,
      phone,
      designation,
      department,
      joiningDate,
      status: status ?? "Active",
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
  const message =
    error instanceof Error ? error.message : "Failed to create employee";

  if (message === "Email already exists") {
    return res.status(409).json({
      success: false,
      message,
    });
  }

  if (
    message === "Invalid employee role" ||
    message === "All required employee fields must be provided" ||
    message === "Invalid phone number" ||
    message === "Invalid joining date" ||
    message === "Name must be between 3 and 100 characters" ||
    message === "Invalid email address" ||
    message === "Invalid department" ||
    message === "Super Admin cannot be created through employee onboarding"
    
  ) {
    return res.status(400).json({
      success: false,
      message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Failed to create employee",
  });
}
};

// PUT update employee
export const editEmployee = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const {
      name,
      email,
      role,
      phone,
      designation,
      department,
      joiningDate,
      status,
    } = req.body || {};

    const employee = await updateEmployee(id, {
      name,
      email,
      role,
      phone,
      designation,
      department,
      joiningDate,
      status,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update employee";

    const validationErrors = [
      "Invalid role",
      "Name must be between 3 and 100 characters",
      "Invalid email address",
      "Email already exists",
      "Invalid phone number",
      "Invalid department",
      "Invalid status",
      "Designation is required",
      "Invalid joining date",
    ];

    if (validationErrors.includes(message)) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update employee",
    });
  }
};

// DELETE employee
export const removeEmployee = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const employee = await deleteEmployee(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete employee",
    });
  }
};



 // GET all tasks assigned to a specific employee
export const getTasksByEmployee = async (
  req: Request,
  res: Response
) => {
  try {
    const employeeId = String(req.params.id);

    // Get logged-in user from JWT middleware
    const user = (req as any).user;

    // Check employee ownership
    if (
      user.role !== "Super Admin" &&
      user.id !== employeeId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own tasks",
      });
    }

    const tasks = await getEmployeeTasks(employeeId);

    if (tasks === null) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee tasks",
    });
  }
};