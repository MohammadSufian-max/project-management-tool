import { create } from "zustand";

export interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  designation: string;
  department: string;
  joiningDate: string;
}

interface ProfileState {
  profile: AdminProfile | null;
  setProfile: (profile: AdminProfile) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
}));