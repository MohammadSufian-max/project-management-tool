
import type { Employee, Project, Task } from "../types";
import { mockTasks } from "../data/mockTasks";
import { mockProjects } from "../data/mockProjects";
import { mockEmployees } from "../data/mockEmployees";
import { readStorage, writeStorage } from "./storageService";

const TASKS_KEY = "pmt_tasks";
const PROJECTS_KEY = "pmt_projects";
const EMPLOYEES_KEY = "pmt_employees";

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredProjects(): Project[] {
  return readStorage<Project[]>(PROJECTS_KEY, mockProjects);
}

function getStoredEmployees(): Employee[] {
  return readStorage<Employee[]>(EMPLOYEES_KEY, mockEmployees);
}

function validateTaskAssignment(task: Task): void {
  const projects = getStoredProjects();
  const employees = getStoredEmployees();

  const project = projects.find((item) => item.id === task.projectId);

  if (!project) {
    throw new Error("Select a valid project.");
  }

  if (project.isArchived) {
    throw new Error("Cannot assign tasks to an archived project.");
  }

  const assignee = employees.find(
    (employee) => employee.id === task.assigneeId,
  );

  if (!assignee || assignee.status !== "Active") {
    throw new Error("Assignee must be an active employee.");
  }

  if (!project.teamMemberIds.includes(assignee.id)) {
    throw new Error(
      "Assignee must belong to the selected project's team.",
    );
  }

  function isValidDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }

  if (
    !isValidDate(project.startDate) ||
    !isValidDate(project.endDate) ||
    project.startDate > project.endDate
  ) {
    throw new Error("The project has an invalid date range.");
  }

  if (!isValidDate(task.startDate) || !isValidDate(task.dueDate)) {
    throw new Error("Enter valid task start and due dates.");
  }

  if (
    task.startDate < project.startDate ||
    task.startDate > project.endDate
  ) {
    throw new Error("Task start date must be within the project dates.");
  }

  if (
    task.dueDate < task.startDate ||
    task.dueDate > project.endDate
  ) {
    throw new Error(
      "Task due date must be on or after its start date and within the project dates.",
    );
  }
}

export async function getTasks(): Promise<Task[]> {
  await delay();

  return readStorage<Task[]>(TASKS_KEY, mockTasks);
}

export async function createTask(task: Task): Promise<Task> {
  await delay();

  validateTaskAssignment(task);

  const tasks = readStorage<Task[]>(TASKS_KEY, mockTasks);

  const updatedTasks = [...tasks, task];

  writeStorage(TASKS_KEY, updatedTasks);

  return task;
}

export async function updateTask(updatedTask: Task): Promise<Task> {
  await delay();

  const tasks = readStorage<Task[]>(TASKS_KEY, mockTasks);

  const existingTask = tasks.find(
    (task) => task.id === updatedTask.id,
  );

  if (!existingTask) {
    throw new Error("Task not found.");
  }

  validateTaskAssignment(updatedTask);

  const updatedTasks = tasks.map((task) =>
    task.id === updatedTask.id ? updatedTask : task,
  );

  writeStorage(TASKS_KEY, updatedTasks);

  return updatedTask;
}

export async function deleteTask(taskId: string): Promise<void> {
  await delay();

  const tasks = readStorage<Task[]>(TASKS_KEY, mockTasks);

  const taskExists = tasks.some((task) => task.id === taskId);

  if (!taskExists) {
    throw new Error("Task not found.");
  }

  const updatedTasks = tasks.filter((task) => task.id !== taskId);

  writeStorage(TASKS_KEY, updatedTasks);
}
