
import { Request, Response } from "express";
import {
  loginUser,
  changeUserPassword,
} from "../services/auth.service";

// POST: User Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Authenticate user
    const result = await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed";

    const statusCode =
      message === "Your account is inactive" ? 403 : 401;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

// GET: Verify logged-in user
export const getCurrentUser = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

// PUT: Change logged-in user's password
export const changePassword = async (
  req: Request,
  res: Response
) => {
  try {
    const { currentPassword, newPassword, confirmPassword } =
      req.body || {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    const user = (req as any).user;

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    await changeUserPassword(
      user.id,
      currentPassword,
      newPassword
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to change password";

    if (message === "Current password is incorrect") {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    if (message === "Employee not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};
