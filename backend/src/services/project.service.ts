
import { AppDataSource } from "../config/database";
import { Project } from "../entities/Project";
import { Employee } from "../entities/Employee";
import { In } from "typeorm";

// Repositories
const projectRepository = AppDataSource.getRepository(Project);
const employeeRepository = AppDataSource.getRepository(Employee);

// Frontend-compatible project data
interface ProjectInput {
  name: string;
  description: string;
  projectManagerId: string;
  teamMemberIds: string[];
  startDate: string;
  endDate: string;
  status: "Planned" | "In Progress" | "On Hold" | "Completed";
  isArchived?: boolean;
}

// Convert database relationships into frontend format
const formatProject = (project: Project) => ({
  id: project.id,
  name: project.name,
  description: project.description,
  projectManagerId: project.projectManager.id,
  teamMemberIds: project.teamMembers.map((employee) => employee.id),
  startDate: project.startDate,
  endDate: project.endDate,
  status: project.status,
  createdAt: project.createdAt.toISOString(),
  isArchived: project.isArchived,
});

// GET: All projects based on user role
export const getAllProjects = async (
  userId?: string,
  userRole?: string
) => {
  const query = projectRepository
  .createQueryBuilder("project")
  .leftJoinAndSelect("project.projectManager", "projectManager")
  .leftJoinAndSelect("project.teamMembers", "teamMembers")
  .where("project.isArchived = :isArchived", {
    isArchived: false,
  })
  .distinct(true);
    

  // Super Admin can see all projects
  if (userRole !== "Super Admin") {
    if (userRole === "Project Manager") {
      // Project Manager can see managed projects and team projects
      query.andWhere(
  "(teamMembers.id = :userId OR projectManager.id = :userId)",
  { userId }
);
    } else {
      // Employee can see only projects they belong to
      query.andWhere(
  "(teamMembers.id = :userId OR projectManager.id = :userId)",
  { userId }
);
    }
  }

  const projects = await query.getMany();

  return projects.map(formatProject);
};

// GET: Project by ID
// GET: Project by ID based on user role
export const getProjectById = async (
  id: string,
  userId?: string,
  userRole?: string
) => {
  const query = projectRepository
    .createQueryBuilder("project")
    .leftJoinAndSelect("project.projectManager", "projectManager")
    .leftJoinAndSelect("project.teamMembers", "teamMembers")
    .where("project.id = :id", { id });

  // Super Admin can access every project
  if (userRole !== "Super Admin") {
    if (userRole === "Project Manager") {
      query.andWhere(
        "(teamMembers.id = :userId OR projectManager.id = :userId)",
        { userId }
      );
    } else {
      query.andWhere("teamMembers.id = :userId", { userId });
    }
  }

  const project = await query.getOne();

  return project ? formatProject(project) : null;
};

// Validate project date format
function isValidProjectDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === date
  );
}

// Validate project dates
function validateProjectDates(
  startDate: string,
  endDate: string
): void {
  if (
    !isValidProjectDate(startDate) ||
    !isValidProjectDate(endDate)
  ) {
    throw new Error("Invalid project date");
  }

  if (startDate > endDate) {
    throw new Error("Project start date cannot be after end date");
  }
}

// Validate project status
function validateProjectStatus(status: string): void {
  const allowedStatuses = [
    "Planned",
    "In Progress",
    "On Hold",
    "Completed",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid project status");
  }
}

// POST: Create project
export const createProject = async (data: ProjectInput) => {

  // Validate project name
  const projectName = data.name?.trim();

  if (!projectName) {
    throw new Error("Project name is required");
  }

  // Validate project dates
  validateProjectDates(data.startDate, data.endDate);

  // Validate project status
  validateProjectStatus(data.status);

  // Validate project manager
  const manager = await employeeRepository.findOne({
    where: {
      id: data.projectManagerId,
      status: "Active",
      role: "Project Manager",
    },
  });

  if (!manager) {
    throw new Error("Active project manager not found");
  }

  // Validate team members
  const teamMembers = await employeeRepository.findBy({
    id: In(data.teamMemberIds),
    status: "Active",
  });

  if (teamMembers.length !== data.teamMemberIds.length) {
    throw new Error(
      "One or more team members are inactive or not found"
    );
  }

  


  // Create project
  const newProject = projectRepository.create({
    id: `proj-${Date.now()}`,
    name: projectName,
    description: data.description,
    projectManager: manager,
    teamMembers,
    startDate: data.startDate,
    endDate: data.endDate,
    status: data.status,
    isArchived: data.isArchived ?? false,
  });

  const savedProject = await projectRepository.save(newProject);

  return formatProject(savedProject);
};

// PUT: Update project
export const updateProject = async (
  id: string,
  data: Partial<ProjectInput>
) => {
  const project = await projectRepository.findOne({
    where: { id },
    relations: {
      projectManager: true,
      teamMembers: true,
    },
  });

  if (!project) return null;

  // Validate project name
  if (data.name !== undefined) {
    const projectName = data.name.trim();

    if (!projectName) {
      throw new Error("Project name is required");
    }

    project.name = projectName;
  }

  // Validate project dates
  const startDate = data.startDate ?? project.startDate;
  const endDate = data.endDate ?? project.endDate;

  validateProjectDates(startDate, endDate);

  // Validate project status
  if (data.status !== undefined) {
    validateProjectStatus(data.status);
    project.status = data.status;
  }

  // Validate project manager
  if (data.projectManagerId !== undefined) {
    const manager = await employeeRepository.findOne({
      where: {
        id: data.projectManagerId,
        status: "Active",
        role: "Project Manager",
      },
    });

    if (!manager) {
      throw new Error("Active project manager not found");
    }

    project.projectManager = manager;
  }

  // Validate team members
  if (data.teamMemberIds !== undefined) {
    const teamMembers = await employeeRepository.findBy({
      id: In(data.teamMemberIds),
      status: "Active",
    });

    if (teamMembers.length !== data.teamMemberIds.length) {
      throw new Error(
        "One or more team members are inactive or not found"
      );
    }

    project.teamMembers = teamMembers;
  }

  // Update remaining fields
  if (data.description !== undefined) {
    project.description = data.description;
  }

  if (data.startDate !== undefined) {
    project.startDate = data.startDate;
  }

  if (data.endDate !== undefined) {
    project.endDate = data.endDate;
  }

  if (data.isArchived !== undefined) {
    project.isArchived = data.isArchived;
  }

  const updatedProject = await projectRepository.save(project);

  return formatProject(updatedProject);
};

// DELETE: Archive project
export const deleteProject = async (id: string) => {
  const project = await projectRepository.findOne({
    where: { id },
    relations: {
      projectManager: true,
      teamMembers: true,
    },
  });

  if (!project) return null;

  project.isArchived = true;

  const archivedProject = await projectRepository.save(project);

  return formatProject(archivedProject);
};


// GET: All tasks of a specific project
// GET: Project tasks based on user role
export const getProjectTasks = async (
  projectId: string,
  userId?: string,
  userRole?: string
) => {
  const project = await projectRepository.findOne({
    where: { id: projectId },
    relations: {
      projectManager: true,
      teamMembers: true,
      tasks: {
        assignee: true,
      },
    },
  });

  if (!project) return null;

  // Super Admin can access all project tasks
  if (userRole !== "Super Admin") {
    if (userRole === "Project Manager") {
      const isManager = project.projectManager.id === userId;

      const isTeamMember = project.teamMembers.some(
        (member) => member.id === userId
      );

      if (!isManager && !isTeamMember) return null;
    } else {
      const isTeamMember = project.teamMembers.some(
        (member) => member.id === userId
      );

      if (!isTeamMember) return null;
    }
  }

  return project.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    projectId: project.id,
    assigneeId: task.assignee.id,
    priority: task.priority,
    status: task.status,
    startDate: task.startDate,
    dueDate: task.dueDate,
    createdAt: task.createdAt.toISOString(),
  }));
};

// GET: Project team based on user role
export const getProjectTeam = async (
  projectId: string,
  userId?: string,
  userRole?: string
) => {
  const project = await projectRepository.findOne({
    where: { id: projectId },
    relations: {
      projectManager: true,
      teamMembers: true,
    },
  });

  if (!project) return null;

  // Super Admin can access every project team
  if (userRole !== "Super Admin") {
    if (userRole === "Project Manager") {
      const isManager =
        project.projectManager.id === userId;

      const isTeamMember = project.teamMembers.some(
        (member) => member.id === userId
      );

      if (!isManager && !isTeamMember) return null;
    } else {
      const isTeamMember = project.teamMembers.some(
        (member) => member.id === userId
      );

      if (!isTeamMember) return null;
    }
  }

  return project.teamMembers.map((employee) => ({
    id: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
  }));
};