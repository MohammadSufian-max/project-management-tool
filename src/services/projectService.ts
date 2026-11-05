import axios from "axios";
import type { Project } from "../types";
import api from "./api";
import { useProjectStore } from "../store/projectStore";

interface BackendProject {
  id: string;
  name: string;
  description: string;
  projectManagerId: string;
  teamMemberIds: string[];
  startDate: string;
  endDate: string;
  status: Project["status"];
  createdAt: string;
  isArchived: boolean;
}

function mapProject(project: BackendProject): Project {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    projectManagerId: project.projectManagerId,
    teamMemberIds: project.teamMemberIds ?? [],
    startDate: project.startDate,
    endDate: project.endDate,
    status: project.status,
    createdAt: project.createdAt,
    isArchived: project.isArchived,
  };
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Project request failed.";
  }

  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}

// GET: Fetch projects
export async function getProjects(): Promise<Project[]> {
  try {
    const response = await api.get("/projects");

    const projects: Project[] = response.data.data.map(
      mapProject
    );

    useProjectStore.getState().setProjects(projects);

    return projects;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// POST: Create project
export async function createProject(
  project: Project
): Promise<Project> {
  try {
    const response = await api.post("/projects", {
      name: project.name,
      description: project.description,
      projectManagerId: project.projectManagerId,
      teamMemberIds: project.teamMemberIds,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      isArchived: project.isArchived ?? false,
    });

    const newProject = mapProject(response.data.data);

    useProjectStore.getState().addProject(newProject);

    return newProject;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// PUT: Update project
export async function updateProject(
  updatedProject: Project
): Promise<Project> {
  try {
    const response = await api.put(
      `/projects/${updatedProject.id}`,
      {
        name: updatedProject.name,
        description: updatedProject.description,
        projectManagerId: updatedProject.projectManagerId,
        teamMemberIds: updatedProject.teamMemberIds,
        startDate: updatedProject.startDate,
        endDate: updatedProject.endDate,
        status: updatedProject.status,
        isArchived: updatedProject.isArchived ?? false,
      }
    );

    const project = mapProject(response.data.data);

    useProjectStore.getState().updateProject(project);

    return project;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// DELETE: Archive project
export async function archiveProject(
  projectId: string
): Promise<Project> {
  try {
    await api.delete(`/projects/${projectId}`);

    const store = useProjectStore.getState();

    const existingProject = store.projects.find(
      (project) => project.id === projectId
    );

    if (!existingProject) {
      throw new Error("Project not found.");
    }

    const archivedProject: Project = {
      ...existingProject,
      isArchived: true,
    };

    store.updateProject(archivedProject);

    return archivedProject;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}