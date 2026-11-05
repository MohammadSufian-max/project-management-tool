import { AppDataSource } from "../config/database";
import { Employee } from "../entities/Employee";
import { Project } from "../entities/Project";
import { Task } from "../entities/Task";

const employeeRepository = AppDataSource.getRepository(Employee);
const projectRepository = AppDataSource.getRepository(Project);
const taskRepository = AppDataSource.getRepository(Task);

// Get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Check overdue task
const isOverdue = (task: Task): boolean => {
  return (
    task.dueDate < getTodayDate() &&
    task.status !== "Done"
  );
};

// Calculate project progress
const calculateProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;

  const completedTasks = tasks.filter(
    (task) => task.status === "Done"
  ).length;

  return Math.round((completedTasks / tasks.length) * 100);
};

// Get Dashboard Data
export const getDashboardData = async (
  userId: string,
  userRole: string
) => {
  // Fetch all unarchived projects
  const projects = await projectRepository.find({
    where: {
      isArchived: false,
    },
    relations: {
      teamMembers: true,
      projectManager: true,
      tasks: true,
    },
  });

  // Fetch tasks with project and assignee
  const allTasks = await taskRepository.find({
    relations: {
      project: true,
      assignee: true,
    },
  });

  // Exclude tasks belonging to archived projects
  const activeTasks = allTasks.filter(
    (task) => task.project && !task.project.isArchived
  );

  // Super Admin Dashboard
  if (userRole === "Super Admin") {
    const totalEmployees = await employeeRepository.count();

    const completedTasks = activeTasks.filter(
      (task) => task.status === "Done"
    );

    const overdueTasks = activeTasks.filter(isOverdue);

    const projectSummary = projects.map((project) => {
      const projectTasks = activeTasks.filter(
        (task) => task.project.id === project.id
      );

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        totalTasks: projectTasks.length,
        completedTasks: projectTasks.filter(
          (task) => task.status === "Done"
        ).length,
        progress: calculateProgress(projectTasks),
      };
    });

    return {
      role: userRole,
      summary: {
        totalEmployees,
        totalProjects: projects.length,
        totalTasks: activeTasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
      },
      projects: projectSummary,
    };
  }

  // Employee / Project Manager Dashboard
  const assignedTasks = activeTasks.filter(
    (task) => task.assignee?.id === userId
  );

  const employeeProjects = projects.filter(
    (project) =>
      project.teamMembers.some((member) => member.id === userId) ||
      project.projectManager?.id === userId
  );

  const completedTasks = assignedTasks.filter(
    (task) => task.status === "Done"
  );

  const pendingTasks = assignedTasks.filter(
    (task) => task.status !== "Done"
  );

  const overdueTasks = assignedTasks.filter(isOverdue);

  const projectSummary = employeeProjects.map((project) => {
    const projectTasks = activeTasks.filter(
      (task) => task.project.id === project.id
    );

    return {
      id: project.id,
      name: project.name,
      status: project.status,
      totalTasks: projectTasks.length,
      completedTasks: projectTasks.filter(
        (task) => task.status === "Done"
      ).length,
      progress: calculateProgress(projectTasks),
    };
  });

  return {
    role: userRole,
    summary: {
      totalAssignedTasks: assignedTasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      overdueTasks: overdueTasks.length,
    },
    projects: projectSummary,
    tasks: assignedTasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      projectId: task.project.id,
      assigneeId: task.assignee.id,
      priority: task.priority,
      status: task.status,
      startDate: task.startDate,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
    })),
  };
};