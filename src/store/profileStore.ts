
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AdminProfile {
  fullName: string;
  phone: string;
}

interface ProfileState {
  adminProfile: AdminProfile;
  setAdminProfile: (profile: AdminProfile) => void;
}

const defaultProfile: AdminProfile = {
  fullName: "Super Admin",
  phone: "",
};

function getInitialProfile(): AdminProfile {
  try {
    const saved = localStorage.getItem("pmt-admin-profile");

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "fullName" in parsed &&
        "phone" in parsed &&
        typeof parsed.fullName === "string" &&
        typeof parsed.phone === "string"
      ) {
        return {
          fullName: parsed.fullName,
          phone: parsed.phone,
        };
      }
    }
  } catch {
    // Fall back to the default profile if legacy data is invalid.
  }

  return defaultProfile;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      adminProfile: getInitialProfile(),

      setAdminProfile: (adminProfile) => set({ adminProfile }),
    }),
    {
      name: "pmt-admin-profile",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        adminProfile: state.adminProfile,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as
          | Partial<ProfileState>
          | undefined;

        return {
          ...currentState,
          adminProfile: persisted?.adminProfile ?? currentState.adminProfile,
        };
      },
    },
  ),
);
