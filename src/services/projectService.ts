
import type { Project } from "../types";
import { useProjectStore } from "../store/projectStore";
import { useEmployeeStore } from "../store/employeeStore";




function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export async function getProjects(): Promise<Project[]> {
  await delay();

  return useProjectStore.getState().projects;
}


 export async function createProject(project: Project): Promise<Project> {
  await delay();

  const store = useProjectStore.getState();
  const projects = store.projects;
  const employees = useEmployeeStore.getState().employees;

  const manager = employees.find(
    (employee) => employee.id === project.projectManagerId
  );

  if (
    !manager ||
    manager.status !== "Active" ||
    manager.role !== "Project Manager"
  ) {
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

  if (projects.some((item) => item.id === project.id)) {
    throw new Error("Project already exists.");
  }

  store.addProject(project);

  return project;
}


export async function updateProject(
  updatedProject: Project
): Promise<Project> {
  await delay();

  const store = useProjectStore.getState();
  const projects = store.projects;
  const employees = useEmployeeStore.getState().employees;

  const existingProject = projects.find(
    (project) => project.id === updatedProject.id
  );

  if (!existingProject) {
    throw new Error("Project not found.");
  }

  const manager = employees.find(
    (employee) => employee.id === updatedProject.projectManagerId
  );

  if (
    !manager ||
    manager.status !== "Active" ||
    manager.role !== "Project Manager"
  ) {
    throw new Error("Select an active Project Manager.");
  }

  const uniqueTeamMemberIds = [...new Set(updatedProject.teamMemberIds)];

  if (uniqueTeamMemberIds.length !== updatedProject.teamMemberIds.length) {
    throw new Error("Duplicate team members are not allowed.");
  }

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

  store.updateProject(updatedProject);

  return updatedProject;
}


export async function archiveProject(
  projectId: string
): Promise<Project> {
  await delay();

  const store = useProjectStore.getState();

  const project = store.projects.find(
    (item) => item.id === projectId
  );

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

  store.updateProject(archivedProject);

  return archivedProject;
}

