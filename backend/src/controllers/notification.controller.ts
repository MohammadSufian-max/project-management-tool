
import { Request, Response } from "express";
import { registerDeviceToken } from "../services/notification.service";

export const registerToken = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const { token } = req.body || {};

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!token || typeof token !== "string" || token.length > 512) {
      return res.status(400).json({
        success: false,
        message: "Valid FCM token is required",
      });
    }

    await registerDeviceToken(user.id, token);

    return res.status(200).json({
      success: true,
      message: "Device token registered successfully",
    });
  } catch (error) {
    console.error("FCM token registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register device token",
    });
  }
};
