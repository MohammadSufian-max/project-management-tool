import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Employee } from "../types";

interface EmployeeState {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
}

const STORAGE_KEY = "pmt-employees";

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set) => ({
      employees: [],

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
      partialize: (state) => ({
        employees: state.employees,
      }),
    },
  ),
);