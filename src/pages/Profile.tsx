
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, ShieldCheck, UserRound, CalendarDays, Pencil, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateEmployee } from "../services/employeeService";

import { useAuthStore } from "../store/authStore";
import { getEmployees } from "../services/employeeService";
import Navbar from "../components/Navbar";

const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Name must have at least 3 characters.")
    .max(100, "Name cannot exceed 100 characters."),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must contain exactly 10 digits."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
const [isEditing, setIsEditing] = useState(false);
const [saveMessage, setSaveMessage] = useState("");
const [adminProfile, setAdminProfile] = useState<ProfileFormValues>(() => {
  try {
    const saved = localStorage.getItem("pmt-admin-profile");
    return saved
      ? JSON.parse(saved)
      : { fullName: "Super Admin", phone: "" };
  } catch {
    return { fullName: "Super Admin", phone: "" };
  }
});

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
    enabled: Boolean(user?.employeeId),
  });

  const employee = user?.employeeId
    ? employees.find((item) => item.id === user.employeeId)
    : undefined;

    const form = useForm<ProfileFormValues>({
  resolver: zodResolver(profileSchema),
  values: {
  fullName: employee?.fullName ?? adminProfile.fullName,
  phone: employee?.phone ?? adminProfile.phone,
},
});
function handleProfileSubmit(values: ProfileFormValues) {
  if (user?.role === "Super Admin") {
    const updatedProfile = {
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
    };

    try {
      localStorage.setItem(
        "pmt-admin-profile",
        JSON.stringify(updatedProfile),
      );
      setAdminProfile(updatedProfile);
      setIsEditing(false);
      setSaveMessage("Profile updated successfully.");
    } catch {
      setSaveMessage("Unable to save profile. Please try again.");
    }

    return;
  }

  updateMutation.mutate(values);
}


const updateMutation = useMutation({
  mutationFn: async (values: ProfileFormValues) => {
    if (!employee) {
      throw new Error("Employee profile not found.");
    }

    return updateEmployee({
      ...employee,
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
    });
  },
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ["employees"] });
    setIsEditing(false);
    setSaveMessage("Profile updated successfully.");
  },
  onError: (error: Error) => {
    setSaveMessage(error.message || "Unable to update profile.");
  },
});

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="p-6">
          <p className="text-slate-600">Please sign in to view your profile.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-4xl space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="mt-2 text-slate-500">
            View your account and employee information.
          </p>
        </div>

        <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center gap-4 border-b pb-6 sm:flex-row">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <UserRound size={38} />
            </div>

           
<div className="flex flex-1 flex-col items-center justify-between gap-4 sm:flex-row">
  <div className="text-center sm:text-left">
    <h2 className="text-2xl font-bold text-slate-900">
      {employee?.fullName ??
  (user.role === "Super Admin" ? adminProfile.fullName : "Employee")}
    </h2>

    <p className="mt-1 text-slate-500">{user.email}</p>

    <span className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
      {user.role}
    </span>
  </div>

  {(employee || user.role === "Super Admin") && !isEditing && (
    <button
      type="button"
      onClick={() => {
  form.reset({
    fullName: employee?.fullName ?? adminProfile.fullName,
    phone: employee?.phone ?? adminProfile.phone,
  });
  setSaveMessage("");
  setIsEditing(true);
}}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
    >
      <Pencil size={16} />
      Edit Profile
    </button>
  )}
</div>

          </div>

          
{isEditing && (employee || user.role === "Super Admin") && (
  <form
    onSubmit={form.handleSubmit(handleProfileSubmit)}
    className="mt-6 space-y-4 rounded-xl border border-slate-200 p-5"
  >
    <h3 className="text-lg font-semibold text-slate-900">
      Edit Profile
    </h3>

    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        Full Name
      </label>
      <input
        {...form.register("fullName")}
        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
      {form.formState.errors.fullName && (
        <p className="mt-1 text-sm text-red-600">
          {form.formState.errors.fullName.message}
        </p>
      )}
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        Phone Number
      </label>
      <input
        {...form.register("phone")}
        type="tel"
        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
      {form.formState.errors.phone && (
        <p className="mt-1 text-sm text-red-600">
          {form.formState.errors.phone.message}
        </p>
      )}
    </div>

    <p className="text-sm text-slate-500">
      Email and Role cannot be edited.
    </p>

    <div className="flex flex-wrap gap-3">
      <button
        type="submit"
        disabled={updateMutation.isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {updateMutation.isPending ? "Saving..." : "Save Changes"}
      </button>

      <button
        type="button"
        onClick={() => {
          form.reset({
  fullName: employee?.fullName ?? adminProfile.fullName,
  phone: employee?.phone ?? adminProfile.phone,
});
          setIsEditing(false);
          setSaveMessage("");
        }}
        className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <X size={16} />
        Cancel
      </button>
    </div>
  </form>
)}


          <div className="grid gap-5 pt-6 sm:grid-cols-2">
            <ProfileItem
  icon={<Mail size={20} />}
  label="Phone Number"
  value={employee?.phone ?? (adminProfile.phone || "Not provided")}
/>

            <ProfileItem
              icon={<ShieldCheck size={20} />}
              label="Account Role"
              value={user.role}
            />

            <ProfileItem
              icon={<UserRound size={20} />}
              label="Employee ID"
              value={user.employeeId ?? "Not linked"}
            />

            <ProfileItem
              icon={<CalendarDays size={20} />}
              label="Account Status"
              value={employee?.status ?? "Demo Admin Account"}
            />

            {employee && (
              <>
                <ProfileItem
                  icon={<UserRound size={20} />}
                  label="Designation"
                  value={employee.designation}
                />

                <ProfileItem
                  icon={<UserRound size={20} />}
                  label="Department"
                  value={employee.department}
                />

                <ProfileItem
                  icon={<CalendarDays size={20} />}
                  label="Joining Date"
                  value={employee.joiningDate}
                />
              </>
            )}
          </div>

          {isLoading && (
            <p className="mt-5 text-sm text-slate-500">
              Loading employee information...
            </p>
          )}

          {saveMessage && (
  <p className="mt-4 text-sm text-blue-700" role="status">
    {saveMessage}
  </p>
)}
        </section>

        <p className="text-sm text-slate-500">
          Update your personal information while keeping your email and role read-only.
        </p>
      </main>
    </div>
  );
}

interface ProfileItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function ProfileItem({ icon, label, value }: ProfileItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">
      <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 break-words font-medium text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}
