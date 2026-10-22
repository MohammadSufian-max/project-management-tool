
import type { Employee } from "../types";
import { mockEmployees } from "../data/mockEmployees";
import { readStorage, writeStorage } from "./storageService";

const STORAGE_KEY = "pmt_employees";

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getEmployees(): Promise<Employee[]> {
  await delay();

  return readStorage<Employee[]>(STORAGE_KEY, mockEmployees);
}

export async function createEmployee(
  employee: Employee,
): Promise<Employee> {
  await delay();

  const employees = readStorage<Employee[]>(
    STORAGE_KEY,
    mockEmployees,
  );

  const emailExists = employees.some(
    (item) => item.email.toLowerCase() === employee.email.toLowerCase(),
  );

  if (emailExists) {
    throw new Error("An employee with this email already exists.");
  }

  const updatedEmployees = [...employees, employee];

  writeStorage(STORAGE_KEY, updatedEmployees);

  return employee;
}

export async function updateEmployee(
  updatedEmployee: Employee,
): Promise<Employee> {
  await delay();

  const employees = readStorage<Employee[]>(
    STORAGE_KEY,
    mockEmployees,
  );

  const emailExists = employees.some(
    (item) =>
      item.id !== updatedEmployee.id &&
      item.email.toLowerCase() === updatedEmployee.email.toLowerCase(),
  );

  if (emailExists) {
    throw new Error("An employee with this email already exists.");
  }

  const updatedEmployees = employees.map((employee) =>
    employee.id === updatedEmployee.id ? updatedEmployee : employee,
  );

  const employeeExists = employees.some(
    (employee) => employee.id === updatedEmployee.id,
  );

  if (!employeeExists) {
    throw new Error("Employee not found.");
  }

  writeStorage(STORAGE_KEY, updatedEmployees);

  return updatedEmployee;
}
