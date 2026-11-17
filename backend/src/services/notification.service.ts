
import { In } from "typeorm";

import { AppDataSource } from "../config/database";
import { Employee } from "../entities/Employee";
import { EmployeeDeviceToken } from "../entities/EmployeeDeviceToken";
import { firebaseMessaging } from "../config/firebase";

const tokenRepository = AppDataSource.getRepository(EmployeeDeviceToken);
const employeeRepository = AppDataSource.getRepository(Employee);

// Unregister current employee device token
export const unregisterDeviceToken = async (
  employeeId: string,
  token: string
) => {
  const deviceToken = await tokenRepository.findOne({
    where: {
      token,
      employee: {
        id: employeeId,
      },
    },
  });

  if (!deviceToken) {
    return false;
  }

  await tokenRepository.remove(deviceToken);

  return true;
};

// Register or update employee device token
export const registerDeviceToken = async (
  employeeId: string,
  token: string
) => {
  const employee = await employeeRepository.findOne({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  let deviceToken = await tokenRepository.findOne({
    where: { token },
  });

  if (deviceToken) {
    deviceToken.employee = employee;
  } else {
    deviceToken = tokenRepository.create({
      token,
      employee,
    });
  }

  await tokenRepository.save(deviceToken);

  return true;
};

// Send push notifications to employees
export const sendPushNotification = async (
  employeeIds: string[],
  title: string,
  body: string,
  data: Record<string, string> = {}
) => {
  const uniqueEmployeeIds = [...new Set(employeeIds)];

  if (uniqueEmployeeIds.length === 0) return;

  const deviceTokens = await tokenRepository
    .createQueryBuilder("deviceToken")
    .leftJoin("deviceToken.employee", "employee")
    .where("employee.id IN (:...employeeIds)", {
      employeeIds: uniqueEmployeeIds,
    })
    .select(["deviceToken.id", "deviceToken.token"])
    .getMany();

  if (deviceTokens.length === 0) return;

  const uniqueTokens = [
    ...new Map(
      deviceTokens.map((item) => [item.token, item])
    ).values(),
  ];

  // Firebase allows maximum 500 tokens per multicast request
  const batchSize = 500;

  for (let i = 0; i < uniqueTokens.length; i += batchSize) {
    const batch = uniqueTokens.slice(i, i + batchSize);

    const response = await firebaseMessaging.sendEachForMulticast({
      tokens: batch.map((item) => item.token),
      notification: {
        title,
        body,
      },
      data,
      webpush: {
        notification: {
          icon: "/favicon.ico",
        },
      },
    });

    const invalidTokens: string[] = [];

    response.responses.forEach((result, index) => {
      if (!result.success) {
        const errorCode = result.error?.code;

        if (
          errorCode === "messaging/registration-token-not-registered" ||
          errorCode === "messaging/invalid-registration-token"
        ) {
          invalidTokens.push(batch[index].token);
        }
      }
    });

    // Remove expired or invalid tokens from database
    if (invalidTokens.length > 0) {
      await tokenRepository.delete({
        token: In(invalidTokens),
      });
    }

    console.log(
      `FCM batch: ${response.successCount} successful, ${response.failureCount} failed`
    );
  }
};
