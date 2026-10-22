
import type { DemoUser } from "../types";
import { mockUsers } from "../data/mockUsers";

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function login(
  email: string,
  password: string
): Promise<DemoUser> {
  await delay();

  const user = mockUsers.find(
    (item) =>
      item.email.toLowerCase() === email.trim().toLowerCase() &&
      item.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  return user;
}
