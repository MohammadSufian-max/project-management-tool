import axios from "axios";
import api from "./api";
import type { AdminProfile } from "../store/profileStore";
import { useProfileStore } from "../store/profileStore";

interface BackendProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  designation: string;
  department: string;
  joiningDate: string;
}

function mapProfile(data: BackendProfile): AdminProfile {
  return {
    id: data.id,
    fullName: data.name,
    email: data.email,
    phone: data.phone ?? "",
    role: data.role,
    designation: data.designation ?? "",
    department: data.department ?? "",
    joiningDate: data.joiningDate ?? "",
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

export async function getProfile(): Promise<AdminProfile> {
  try {
    const response = await api.get("/profile");

    const profile = mapProfile(response.data.data);

    useProfileStore.getState().setProfile(profile);

    return profile;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateProfile(
  values: { fullName: string; phone: string }
): Promise<AdminProfile> {
  try {
    const response = await api.put("/profile", {
      name: values.fullName,
      phone: values.phone,
    });

    const profile = mapProfile(response.data.data);

    useProfileStore.getState().setProfile(profile);

    return profile;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}