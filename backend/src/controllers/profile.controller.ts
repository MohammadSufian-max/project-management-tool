import { Request, Response } from "express";
import {
  getProfile,
  updateProfile,
} from "../services/profile.service";

// GET: Fetch logged-in user's profile
export const fetchProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const profile = await getProfile(user.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: profile,
    });
  } catch (error) {
    console.error("FETCH PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

// PUT: Update logged-in user's profile
export const editProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = req.body || {};

    // Only name and phone can be updated
    const allowedFields = ["name", "phone"];
    const submittedFields = Object.keys(data);

    if (
      submittedFields.length === 0 ||
      !submittedFields.every((field) => allowedFields.includes(field))
    ) {
      return res.status(400).json({
        success: false,
        message: "Only name and phone can be updated",
      });
    }

    if (
      data.name !== undefined &&
      typeof data.name !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid name",
      });
    }

    if (
      data.phone !== undefined &&
      typeof data.phone !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    const profile = await updateProfile(user.id, data);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update profile";

    const validationErrors = [
      "Name must be between 3 and 100 characters",
      "Invalid phone number",
    ];

    if (validationErrors.includes(message)) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};