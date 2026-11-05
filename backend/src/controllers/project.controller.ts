
import { Request, Response } from "express";

import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectTasks,
  getProjectTeam,
} from "../services/project.service";

// GET: All projects
export const getProjects = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const projects = await getAllProjects(
      user.id,
      user.role
    );

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};


// GET: Project by ID
export const getProject = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const user = (req as any).user;

    const project = await getProjectById(
      id,
      user.id,
      user.role
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project",
    });
  }
};

// POST create project
export const addProject = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      projectManagerId,
      teamMemberIds,
      startDate,
      endDate,
      status,
      isArchived,
    } = req.body || {};

    if (
      !name ||
      !description ||
      !projectManagerId ||
      !Array.isArray(teamMemberIds) ||
      !startDate ||
      !endDate ||
      !["Planned", "In Progress", "On Hold", "Completed"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing project fields",
      });
    }

    const project = await createProject({
      name,
      description,
      projectManagerId,
      teamMemberIds,
      startDate,
      endDate,
      status,
      isArchived,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};

// PUT update project
export const editProject = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const project = await updateProject(id, req.body || {});

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });

  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update project";

    const validationErrors = [
      "Project name is required",
      "Invalid project date",
      "Project start date cannot be after end date",
      "Invalid project status",
      "Active project manager not found",
      "One or more team members are inactive or not found",
    ];

    if (validationErrors.includes(message)) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
};

// DELETE project
export const removeProject = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const project = await deleteProject(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project archived successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
};



// GET all tasks of a specific project
export const getTasksByProject = async (
  req: Request,
  res: Response
) => {
  try {
    const projectId = String(req.params.id);
    const user = (req as any).user;

    const tasks = await getProjectTasks(
      projectId,
      user.id,
      user.role
    );

    if (tasks === null) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project tasks",
    });
  }
};


// GET all team members of a specific project
// GET: Project team members
export const getTeamByProject = async (
  req: Request,
  res: Response
) => {
  try {
    const projectId = String(req.params.id);
    const user = (req as any).user;

    const team = await getProjectTeam(
      projectId,
      user.id,
      user.role
    );

    if (team === null) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: team.length,
      data: team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project team",
    });
  }
};