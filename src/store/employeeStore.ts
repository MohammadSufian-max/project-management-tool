
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Employee } from "../types";
import { mockEmployees } from "../data/mockEmployees";

interface EmployeeState {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
}

const STORAGE_KEY = "pmt-employees";
const LEGACY_STORAGE_KEY = "pmt_employees";

function getInitialEmployees(): Employee[] {
  try {
    const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);

    if (legacyData) {
      const parsed: unknown = JSON.parse(legacyData);

      if (
        Array.isArray(parsed) &&
        parsed.every(
          (item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.fullName === "string" &&
            typeof item.email === "string",
        )
      ) {
        return parsed as Employee[];
      }
    }
  } catch (error) {
    console.error("Could not read legacy employee data:", error);
  }

  return mockEmployees;
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set) => ({
      employees: getInitialEmployees(),

      setEmployees: (employees) => set({ employees }),

      addEmployee: (employee) =>
        set((state) => ({
          employees: [...state.employees, employee],
        })),

      updateEmployee: (updatedEmployee) =>
        set((state) => ({
          employees: state.employees.map((employee) =>
            employee.id === updatedEmployee.id
              ? updatedEmployee
              : employee,
          ),
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ employees: state.employees }),
    },
  ),
);

