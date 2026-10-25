
import type { Employee } from "../types";
import { useEmployeeStore } from "../store/employeeStore";

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getEmployees(): Promise<Employee[]> {
  await delay();
  return useEmployeeStore.getState().employees;
}

export async function createEmployee(
  employee: Employee,
): Promise<Employee> {
  await delay();

  const store = useEmployeeStore.getState();

  const emailExists = store.employees.some(
    (item) => item.email.toLowerCase() === employee.email.toLowerCase(),
  );

  if (emailExists) {
    throw new Error("An employee with this email already exists.");
  }

  store.addEmployee(employee);

  return employee;
}

export async function updateEmployee(
  updatedEmployee: Employee,
): Promise<Employee> {
  await delay();

  const store = useEmployeeStore.getState();

  const emailExists = store.employees.some(
    (item) =>
      item.id !== updatedEmployee.id &&
      item.email.toLowerCase() === updatedEmployee.email.toLowerCase(),
  );

  if (emailExists) {
    throw new Error("An employee with this email already exists.");
  }

  const employeeExists = store.employees.some(
    (employee) => employee.id === updatedEmployee.id,
  );

  if (!employeeExists) {
    throw new Error("Employee not found.");
  }

  store.updateEmployee(updatedEmployee);

  return updatedEmployee;
}
