import { Request, Response } from "express";
import { loginUser } from "../services/auth.service";

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