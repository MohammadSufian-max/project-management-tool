import type { DemoUser } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: "Super Admin" | "Employee" | "Project Manager";
    };
  };
}

export async function login(
  email: string,
  password: string
): Promise<{ user: DemoUser; token: string }> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });

  const result: LoginResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Invalid email or password.");
  }

  return {
    user: {
      id: result.data.user.id,
      name: result.data.user.name,
      email: result.data.user.email,
      role: result.data.user.role,
    },
    token: result.data.token,
  };
}