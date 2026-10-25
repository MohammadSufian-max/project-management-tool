import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Task } from "../types";
import { mockTasks } from "../data/mockTasks";

interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
}

function getInitialTasks(): Task[] {
  try {
    const savedData = localStorage.getItem("pmt_tasks");

    if (savedData) {
      const parsed: unknown = JSON.parse(savedData);

      if (Array.isArray(parsed)) {
        return parsed as Task[];
      }
    }
  } catch (error) {
    console.error("Could not read existing tasks:", error);
  }

  return mockTasks;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: getInitialTasks(),

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      updateTask: (updatedTask) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          ),
        })),

      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        })),
    }),
    {
      name: "pmt-tasks",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);