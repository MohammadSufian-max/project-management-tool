import axios from "axios";
import type { Employee } from "../types";
import api from "./api";
import { useEmployeeStore } from "../store/employeeStore";

interface BackendEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: Employee["department"];
  role: Employee["role"];
  joiningDate: string;
  status: Employee["status"];
  createdAt: string;
}

function mapEmployee(employee: BackendEmployee): Employee {
  return {
    id: employee.id,
    fullName: employee.name,
    email: employee.email,
    phone: employee.phone,
    designation: employee.designation,
    department: employee.department,
    role: employee.role,
    joiningDate: employee.joiningDate,
    status: employee.status,
    createdAt: employee.createdAt,
  };
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Employee request failed.";
  }

  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}

// GET employees
export async function getEmployees(): Promise<Employee[]> {
  try {
    const response = await api.get("/employees");

    const employees: Employee[] = response.data.data.map(
      mapEmployee
    );

    useEmployeeStore.getState().setEmployees(employees);

    return employees;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// CREATE employee
export async function createEmployee(
  employee: Employee,
): Promise<Employee> {
  try {
    const response = await api.post("/employees", {
      name: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      designation: employee.designation,
      department: employee.department,
      role: employee.role,
      joiningDate: employee.joiningDate,
      status: employee.status,
    });

    const newEmployee = mapEmployee(response.data.data);

    useEmployeeStore.getState().addEmployee(newEmployee);

    return newEmployee;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// UPDATE employee
export async function updateEmployee(
  updatedEmployee: Employee,
): Promise<Employee> {
  try {
    const response = await api.put(
      `/employees/${updatedEmployee.id}`,
      {
        name: updatedEmployee.fullName,
        email: updatedEmployee.email,
        phone: updatedEmployee.phone,
        designation: updatedEmployee.designation,
        department: updatedEmployee.department,
        role: updatedEmployee.role,
        joiningDate: updatedEmployee.joiningDate,
        status: updatedEmployee.status,
      }
    );

    const employee = mapEmployee(response.data.data);

    useEmployeeStore.getState().updateEmployee(employee);

    return employee;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}