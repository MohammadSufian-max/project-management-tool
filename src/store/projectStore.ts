
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Project } from "../types";
import { mockProjects } from "../data/mockProjects";

interface ProjectState {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
}

function getInitialProjects(): Project[] {
  try {
    const savedData = localStorage.getItem("pmt_projects");

    if (savedData) {
      const parsed: unknown = JSON.parse(savedData);

      if (Array.isArray(parsed)) {
        return parsed as Project[];
      }
    }
  } catch (error) {
    console.error("Could not read existing projects:", error);
  }

  return mockProjects;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: getInitialProjects(),

      setProjects: (projects) => set({ projects }),

      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
        })),

      updateProject: (updatedProject) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === updatedProject.id ? updatedProject : project,
          ),
        })),
    }),
    {
      name: "pmt-projects",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ projects: state.projects }),
    },
  ),
);
