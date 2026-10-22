
import type { Employee, Project } from "../types";
import { mockProjects } from "../data/mockProjects";
import { mockEmployees } from "../data/mockEmployees";
import { readStorage, writeStorage } from "./storageService";

const PROJECTS_KEY = "pmt_projects";
const EMPLOYEES_KEY = "pmt_employees";

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredEmployees(): Employee[] {
  return readStorage<Employee[]>(EMPLOYEES_KEY, mockEmployees);
}

export async function getProjects(): Promise<Project[]> {
  await delay();

  return readStorage<Project[]>(PROJECTS_KEY, mockProjects);
}

export async function createProject(
  project: Project,
): Promise<Project> {
  await delay();

  const projects = readStorage<Project[]>(PROJECTS_KEY, mockProjects);
  const employees = getStoredEmployees();

  const manager = employees.find(
    (employee) => employee.id === project.projectManagerId,
  );

  if (!manager || manager.status !== "Active" || manager.role !== "Project Manager") {
    throw new Error("Select an active Project Manager.");
  }

  const uniqueTeamMemberIds = [...new Set(project.teamMemberIds)];

  if (uniqueTeamMemberIds.length !== project.teamMemberIds.length) {
    throw new Error("Duplicate team members are not allowed.");
  }

  const invalidMember = uniqueTeamMemberIds.some((id) => {
    const employee = employees.find((item) => item.id === id);
    return !employee || employee.status !== "Active";
  });

  if (invalidMember) {
    throw new Error("All team members must be active employees.");
  }

  if (project.endDate < project.startDate) {
    throw new Error("Project end date cannot be before its start date.");
  }

  const updatedProjects = [...projects, project];

  writeStorage(PROJECTS_KEY, updatedProjects);

  return project;
}


export async function updateProject(
  updatedProject: Project,
): Promise<Project> {
  await delay();

  const projects = readStorage<Project[]>(PROJECTS_KEY, mockProjects);
  const employees = getStoredEmployees();

  const existingProject = projects.find(
    (project) => project.id === updatedProject.id,
  );

  if (!existingProject) {
    throw new Error("Project not found.");
  }

  // The project manager must still be an active Project Manager.
  const manager = employees.find(
    (employee) => employee.id === updatedProject.projectManagerId,
  );

  if (
    !manager ||
    manager.status !== "Active" ||
    manager.role !== "Project Manager"
  ) {
    throw new Error("Select an active Project Manager.");
  }

  // Prevent duplicate team members.
  const uniqueTeamMemberIds = [...new Set(updatedProject.teamMemberIds)];

  if (uniqueTeamMemberIds.length !== updatedProject.teamMemberIds.length) {
    throw new Error("Duplicate team members are not allowed.");
  }

  // Only newly added team members must be active.
  // Existing inactive members do not block unrelated project edits.
  const existingMemberIds = new Set(existingProject.teamMemberIds);

  const invalidNewMember = uniqueTeamMemberIds.some((id) => {
    if (existingMemberIds.has(id)) {
      return false;
    }

    const employee = employees.find((item) => item.id === id);

    return !employee || employee.status !== "Active";
  });

  if (invalidNewMember) {
    throw new Error("New team members must be active employees.");
  }

  if (updatedProject.endDate < updatedProject.startDate) {
    throw new Error("Project end date cannot be before its start date.");
  }

  const updatedProjects = projects.map((project) =>
    project.id === updatedProject.id ? updatedProject : project,
  );

  writeStorage(PROJECTS_KEY, updatedProjects);

  return updatedProject;
}

export async function archiveProject(
  projectId: string,
): Promise<Project> {
  await delay();

  const projects = readStorage<Project[]>(PROJECTS_KEY, mockProjects);

  const project = projects.find((item) => item.id === projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  if (project.isArchived) {
    throw new Error("Project is already archived.");
  }

  const archivedProject: Project = {
    ...project,
    isArchived: true,
  };

  const updatedProjects = projects.map((item) =>
    item.id === projectId ? archivedProject : item,
  );

  writeStorage(PROJECTS_KEY, updatedProjects);

  return archivedProject;
}

