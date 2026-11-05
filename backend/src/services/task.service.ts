
import { AppDataSource } from "../config/database";
import { Task } from "../entities/Task";
import { Project } from "../entities/Project";
import { Employee } from "../entities/Employee";

// Repositories
const taskRepository = AppDataSource.getRepository(Task);
const projectRepository = AppDataSource.getRepository(Project);
const employeeRepository = AppDataSource.getRepository(Employee);

// Frontend-compatible task data
interface TaskInput {
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  priority: "Low" | "Medium" | "High";
  status: "To Do" | "In Progress" | "Done";
  startDate: string;
  dueDate: string;
}

// Convert database relationships into frontend format
const formatTask = (task: Task) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  projectId: task.project.id,
  assigneeId: task.assignee.id,
  priority: task.priority,
  status: task.status,
  startDate: task.startDate,
  dueDate: task.dueDate,
  createdAt: task.createdAt.toISOString(),
});

// GET: All tasks based on user role
export const getAllTasks = async (
  userId?: string,
  userRole?: string
) => {
  const query = taskRepository
    .createQueryBuilder("task")
    .leftJoinAndSelect("task.project", "project")
    .leftJoinAndSelect("task.assignee", "assignee");

  // Super Admin can see all tasks
  if (userRole !== "Super Admin") {
    query.where("assignee.id = :userId", { userId });
  }

  const tasks = await query.getMany();

  return tasks.map(formatTask);
};

export const getTaskById = async (
  id: string,
  userId?: string,
  userRole?: string
) => {
  const task = await taskRepository.findOne({
    where: { id },
    relations: {
      project: true,
      assignee: true,
    },
  });

  if (!task) return null;

  if (
    userRole !== "Super Admin" &&
    task.assignee.id !== userId
  ) {
    return null;
  }

  return formatTask(task);
};


// Validate task date format
function isValidTaskDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === date
  );
}

// Validate task dates against project dates
function validateTaskDates(
  startDate: string,
  dueDate: string,
  projectStartDate: string,
  projectEndDate: string
): void {
  if (
    !isValidTaskDate(startDate) ||
    !isValidTaskDate(dueDate)
  ) {
    throw new Error("Invalid task date");
  }

  if (
    startDate < projectStartDate ||
    startDate > projectEndDate
  ) {
    throw new Error("Task start date must be within project dates");
  }

  if (
    dueDate < startDate ||
    dueDate > projectEndDate
  ) {
    throw new Error(
      "Task due date must be after start date and within project dates"
    );
  }
}

// Validate task priority
function validateTaskPriority(priority: string): void {
  if (!["Low", "Medium", "High"].includes(priority)) {
    throw new Error("Invalid task priority");
  }
}

// Validate task status
function validateTaskStatus(status: string): void {
  if (!["To Do", "In Progress", "Done"].includes(status)) {
    throw new Error("Invalid task status");
  }
}

// POST: Create task
export const createTask = async (data: TaskInput) => {

  // Validate title
  const title = data.title?.trim();

  if (!title) {
    throw new Error("Task title is required");
  }

  // Validate priority and status
  validateTaskPriority(data.priority);
  validateTaskStatus(data.status);

  // Find project
  const project = await projectRepository.findOne({
    where: { id: data.projectId },
    relations: {
      teamMembers: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Validate dates
  validateTaskDates(
    data.startDate,
    data.dueDate,
    project.startDate,
    project.endDate
  );

  // Find active employee
  const employee = await employeeRepository.findOne({
    where: {
      id: data.assigneeId,
      status: "Active",
    },
  });

  if (!employee) {
    throw new Error("Assignee employee is inactive or not found");
  }

  // Check project team membership
  const isTeamMember = project.teamMembers.some(
    (member) => member.id === employee.id
  );

  if (!isTeamMember) {
    throw new Error("Assignee is not a member of this project team");
  }

  // Create task
  const newTask = taskRepository.create({
    id: `task-${Date.now()}`,
    title,
    description: data.description,
    project,
    assignee: employee,
    priority: data.priority,
    status: data.status,
    startDate: data.startDate,
    dueDate: data.dueDate,
  });

  const savedTask = await taskRepository.save(newTask);

  return formatTask(savedTask);
};

// PUT: Update task
export const updateTask = async (
  id: string,
  data: Partial<TaskInput>
) => {
  const task = await taskRepository.findOne({
    where: { id },
    relations: {
      project: true,
      assignee: true,
    },
  });

  if (!task) return null;

  // Validate title
  if (data.title !== undefined) {
    const title = data.title.trim();

    if (!title) {
      throw new Error("Task title is required");
    }

    task.title = title;
  }

  // Validate priority
  if (data.priority !== undefined) {
    validateTaskPriority(data.priority);
    task.priority = data.priority;
  }

  // Validate status
  if (data.status !== undefined) {
    validateTaskStatus(data.status);
    task.status = data.status;
  }

  // Get target project
  const projectId = data.projectId ?? task.project.id;

  const project = await projectRepository.findOne({
    where: { id: projectId },
    relations: {
      teamMembers: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Get target assignee
  const assigneeId = data.assigneeId ?? task.assignee.id;

  const employee = await employeeRepository.findOne({
    where: {
      id: assigneeId,
      status: "Active",
    },
  });

  if (!employee) {
    throw new Error("Assignee employee is inactive or not found");
  }

  // Validate project team membership
  const isTeamMember = project.teamMembers.some(
    (member) => member.id === employee.id
  );

  if (!isTeamMember) {
    throw new Error("Assignee is not a member of this project team");
  }

  // Validate dates against target project
  const startDate = data.startDate ?? task.startDate;
  const dueDate = data.dueDate ?? task.dueDate;

  validateTaskDates(
    startDate,
    dueDate,
    project.startDate,
    project.endDate
  );

  // Update relationships
  task.project = project;
  task.assignee = employee;

  // Update remaining fields
  if (data.description !== undefined) {
    task.description = data.description;
  }

  if (data.startDate !== undefined) {
    task.startDate = data.startDate;
  }

  if (data.dueDate !== undefined) {
    task.dueDate = data.dueDate;
  }

  const updatedTask = await taskRepository.save(task);

  return formatTask(updatedTask);
};

// DELETE: Delete task
export const deleteTask = async (id: string) => {
  const task = await taskRepository.findOne({
    where: { id },
    relations: {
      project: true,
      assignee: true,
    },
  });

  if (!task) return null;

  const formattedTask = formatTask(task);

  await taskRepository.remove(task);

  return formattedTask;
};
