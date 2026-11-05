
import { Request, Response } from "express";

import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../services/task.service";

// GET all tasks based on user role
export const getTasks = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const tasks = await getAllTasks(
      user.id,
      user.role
    );

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

// GET: Task by ID
export const getTask = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const user = (req as any).user;

    const task = await getTaskById(
      id,
      user.id,
      user.role
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch task",
    });
  }
};

// POST create task
export const addTask = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      projectId,
      assigneeId,
      priority,
      status,
      startDate,
      dueDate,
    } = req.body || {};

    if (
      !title?.trim() ||
      !description?.trim() ||
      !projectId ||
      !assigneeId ||
      !startDate ||
      !dueDate ||
      !["Low", "Medium", "High"].includes(priority) ||
      !["To Do", "In Progress", "Done"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing task fields",
      });
    }

    const task = await createTask({
      title,
      description,
      projectId,
      assigneeId,
      priority,
      status,
      startDate,
      dueDate,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });

  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create task";

    const validationErrors = [
      "Task title is required",
      "Invalid task priority",
      "Invalid task status",
      "Invalid task date",
      "Project not found",
      "Task start date must be within project dates",
      "Task due date must be after start date and within project dates",
      "Assignee employee is inactive or not found",
      "Assignee is not a member of this project team",
    ];

    if (validationErrors.includes(message)) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    console.error("CREATE TASK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

// PUT: Update task
export const editTask = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const user = (req as any).user;
    const data = req.body || {};

    // Employee can update only their own task status
    if (user.role !== "Super Admin") {
      const taskExists = await getTaskById(
        id,
        user.id,
        user.role
      );

      if (!taskExists) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // Only status field is allowed
      const allowedFields = ["status"];
      const submittedFields = Object.keys(data);

      if (
        submittedFields.length !== 1 ||
        !submittedFields.every((field) =>
          allowedFields.includes(field)
        )
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only update your task status",
        });
      }

      if (!["To Do", "In Progress", "Done"].includes(data.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task status",
        });
      }
    }

    const task = await updateTask(id, data);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });

  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update task";

    const validationErrors = [
      "Task title is required",
      "Invalid task priority",
      "Invalid task status",
      "Invalid task date",
      "Project not found",
      "Task start date must be within project dates",
      "Task due date must be after start date and within project dates",
      "Assignee employee is inactive or not found",
      "Assignee is not a member of this project team",
    ];

    if (validationErrors.includes(message)) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    console.error("EDIT TASK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};

// DELETE task
export const removeTask = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const task = await deleteTask(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
};
