import axios from "axios";
import type { Task } from "../types";
import api from "./api";
import { useTaskStore } from "../store/taskStore";
import { useAuthStore } from "../store/authStore";

interface BackendTask {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  priority: Task["priority"];
  status: Task["status"];
  startDate: string;
  dueDate: string;
  createdAt: string;
}

function mapTask(task: BackendTask): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    projectId: task.projectId,
    assigneeId: task.assigneeId,
    priority: task.priority,
    status: task.status,
    startDate: task.startDate,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
  };
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Something went wrong.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export async function getTasks(): Promise<Task[]> {
  try {
    const response = await api.get("/tasks");

    const tasks: Task[] = response.data.data.map(mapTask);

    useTaskStore.getState().setTasks(tasks);

    return tasks;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createTask(task: Task): Promise<Task> {
  try {
    const response = await api.post("/tasks", {
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      priority: task.priority,
      status: task.status,
      startDate: task.startDate,
      dueDate: task.dueDate,
    });

    const newTask = mapTask(response.data.data);

    useTaskStore.getState().addTask(newTask);

    return newTask;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateTask(updatedTask: Task): Promise<Task> {
  try {
    const user = useAuthStore.getState().user;

    const payload =
      user?.role === "Super Admin"
        ? {
            title: updatedTask.title,
            description: updatedTask.description,
            projectId: updatedTask.projectId,
            assigneeId: updatedTask.assigneeId,
            priority: updatedTask.priority,
            status: updatedTask.status,
            startDate: updatedTask.startDate,
            dueDate: updatedTask.dueDate,
          }
        : {
            status: updatedTask.status,
          };

    const response = await api.put(
      `/tasks/${updatedTask.id}`,
      payload
    );

    const task = mapTask(response.data.data);

    useTaskStore.getState().updateTask(task);

    return task;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    await api.delete(`/tasks/${taskId}`);

    useTaskStore.getState().deleteTask(taskId);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}