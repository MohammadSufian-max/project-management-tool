
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Plus, Search, Users, X } from "lucide-react";

import { getEmployees, createEmployee, updateEmployee } from "../services/employeeService";
import { useAuthStore } from "../store/authStore";
import Navbar from "../components/Navbar";
import type { Employee } from "../types";

const employeeSchema = z.object({
  
fullName: z
  .string()
  .trim()
  .min(3, "Name must have at least 3 characters.")
  .max(100, "Name cannot exceed 100 characters."),

  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().regex(/^[0-9]{10}$/, "Enter a 10-digit phone number."),
  designation: z.string().trim().min(2, "Designation is required."),
  department: z.enum(["Engineering", "Design", "QA", "Business", "Other"]),
  role: z.enum(["Employee", "Project Manager"]),
  
joiningDate: z
  .string()
  .trim()
  .min(1, "Joining date is required.")
  .refine(
    (value) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
      }

      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    },
    "Enter a valid joining date.",
  ),

  status: z.enum(["Active", "Inactive"]),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

const emptyValues: EmployeeFormValues = {
  fullName: "",
  email: "",
  phone: "",
  designation: "",
  department: "Engineering",
  role: "Employee",
  joiningDate: new Date().toISOString().slice(0, 10),
  status: "Active",
};

export default function Employees() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [formError, setFormError] = useState("");

  const { data: employees = [], isLoading, isError } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: emptyValues,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: EmployeeFormValues) => {
      const employee: Employee = {
        ...values,
        id: editingEmployee?.id ?? `emp-${crypto.randomUUID()}`,
        createdAt: editingEmployee?.createdAt ?? new Date().toISOString(),
      };

      return editingEmployee
        ? updateEmployee(employee)
        : createEmployee(employee);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      setShowForm(false);
      setEditingEmployee(null);
      setFormError("");
      form.reset(emptyValues);
    },
    onError: (error: Error) => {
      setFormError(error.message || "Unable to save employee.");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (employee: Employee) =>
      updateEmployee({
        ...employee,
        status: employee.status === "Active" ? "Inactive" : "Active",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) =>
      [
        employee.fullName,
        employee.email,
        employee.designation,
        employee.department,
        employee.role,
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [employees, search]);

  function openAddForm() {
    setEditingEmployee(null);
    setFormError("");
    form.reset(emptyValues);
    setShowForm(true);
  }

  function openEditForm(employee: Employee) {
    setEditingEmployee(employee);
    setFormError("");
    form.reset({
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      designation: employee.designation,
      department: employee.department,
      role: employee.role,
      joiningDate: employee.joiningDate,
      status: employee.status,
    });
    setShowForm(true);
  }

  function onSubmit(values: EmployeeFormValues) {
    setFormError("");
    saveMutation.mutate(values);
  }

  if (user?.role !== "Super Admin") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="p-6">
          <h1 className="text-xl font-semibold">Access denied</h1>
          <p className="mt-2 text-slate-600">
            Only Super Admin can manage employees.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Employee Onboarding
            </h1>
            <p className="mt-2 text-slate-500">
              Add and manage your organization&apos;s employees.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5">
            <div className="flex items-center gap-3 text-slate-500">
              <Users size={20} />
              Total Employees
            </div>
            <p className="mt-3 text-3xl font-bold">{employees.length}</p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Active Employees</p>
            <p className="mt-3 text-3xl font-bold text-green-600">
              {employees.filter((employee) => employee.status === "Active").length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Project Managers</p>
            <p className="mt-3 text-3xl font-bold text-blue-600">
              {employees.filter((employee) => employee.role === "Project Manager").length}
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-xl border bg-white">
          <div className="border-b p-4">
            <div className="relative max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, role..."
                className="w-full rounded-lg border py-3 pl-10 pr-4 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {isLoading ? (
            <p className="p-6 text-slate-500">Loading employees...</p>
          ) : isError ? (
            <p className="p-6 text-red-600">Could not load employees. Refresh and try again.</p>
          ) : filteredEmployees.length === 0 ? (
            <p className="p-6 text-slate-500">No matching employees found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                
<thead className="bg-slate-50 text-slate-500">
  <tr>
    <th className="px-5 py-4 font-medium">Employee ID</th>
    <th className="px-5 py-4 font-medium">Employee</th>
    <th className="px-5 py-4 font-medium">Phone</th>
    <th className="px-5 py-4 font-medium">Designation</th>
    <th className="px-5 py-4 font-medium">Department</th>
    <th className="px-5 py-4 font-medium">Role</th>
    <th className="px-5 py-4 font-medium">Status</th>
    <th className="px-5 py-4 font-medium">Actions</th>
  </tr>
</thead>

<tbody>
  {filteredEmployees.map((employee) => (
    <tr key={employee.id} className="border-t hover:bg-slate-50">
      <td className="px-5 py-4 text-slate-600">
        {employee.id}
      </td>

      <td className="px-5 py-4">
        <p className="font-semibold text-slate-800">
          {employee.fullName}
        </p>
        <p className="mt-1 text-slate-500">{employee.email}</p>
      </td>

      <td className="px-5 py-4">{employee.phone}</td>
      <td className="px-5 py-4">{employee.designation}</td>
      <td className="px-5 py-4">{employee.department}</td>
      <td className="px-5 py-4">{employee.role}</td>

      <td className="px-5 py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            employee.status === "Active"
              ? "bg-green-50 text-green-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {employee.status}
        </span>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
  setShowForm(false);
  setEditingEmployee(null);
  setViewingEmployee(employee);
}}
            title="View employee details"
            aria-label={`View ${employee.fullName}`}
            className="text-slate-600 underline hover:text-slate-900"
          >
            View
          </button>

          <button
            type="button"
            onClick={() => {
  setViewingEmployee(null);
  openEditForm(employee);
}}
            title="Edit employee"
            aria-label={`Edit ${employee.fullName}`}
            className="text-blue-600 hover:text-blue-800"
          >
            <Pencil size={18} />
          </button>

          <button
            type="button"
            disabled={toggleMutation.isPending}
            onClick={() => {
              if (
                window.confirm(
                  `Are you sure you want to ${
                    employee.status === "Active" ? "deactivate" : "activate"
                  } ${employee.fullName}?`
                )
              ) {
                toggleMutation.mutate(employee);
              }
            }}
            className="text-sm text-slate-600 underline disabled:opacity-50"
          >
            {employee.status === "Active" ? "Deactivate" : "Activate"}
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

              </table>
            </div>
          )}
        </section>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="employee-form-title"
              className="my-6 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 id="employee-form-title" className="text-xl font-bold">
                    {editingEmployee ? "Edit Employee" : "Add Employee"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter the employee details below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  aria-label="Close form"
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Full Name" error={form.formState.errors.fullName?.message}>
                    <input {...form.register("fullName")} className="form-input" placeholder="Enter full name" />
                  </FormField>

                  <FormField label="Email" error={form.formState.errors.email?.message}>
                    <input {...form.register("email")} type="email" className="form-input" placeholder="name@example.com" />
                  </FormField>

                  <FormField label="Phone" error={form.formState.errors.phone?.message}>
                    <input {...form.register("phone")} inputMode="numeric" maxLength={10} className="form-input" placeholder="10-digit phone number" />
                  </FormField>

                  <FormField label="Designation" error={form.formState.errors.designation?.message}>
                    <input {...form.register("designation")} className="form-input" placeholder="e.g. Frontend Developer" />
                  </FormField>

                  <FormField label="Department" error={form.formState.errors.department?.message}>
                    <select {...form.register("department")} className="form-input">
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="QA">QA</option>
                      <option value="Business">Business</option>
                      <option value="Other">Other</option>
                    </select>
                  </FormField>

                  <FormField label="Role" error={form.formState.errors.role?.message}>
                    <select {...form.register("role")} className="form-input">
                      <option value="Employee">Employee</option>
                      <option value="Project Manager">Project Manager</option>
                    </select>
                  </FormField>

                  <FormField label="Joining Date" error={form.formState.errors.joiningDate?.message}>
                    <input {...form.register("joiningDate")} type="date" className="form-input" />
                  </FormField>

                  <FormField label="Status" error={form.formState.errors.status?.message}>
                    <select {...form.register("status")} className="form-input">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </FormField>
                </div>

                {formError && (
                  <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {formError}
                  </p>
                )}

                <div className="flex justify-end gap-3 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border px-4 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saveMutation.isPending
                      ? "Saving..."
                      : editingEmployee
                        ? "Save Changes"
                        : "Create Employee"}
                  </button>
                </div>
              </form>
            </section>
                      </div>
        )}
            
{viewingEmployee && (
  <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-employee-title"
      className="my-6 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 id="view-employee-title" className="text-xl font-bold">
          Employee Details
        </h2>

        <button
          type="button"
          onClick={() => setViewingEmployee(null)}
          aria-label="Close employee details"
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {[
          ["Employee ID", viewingEmployee.id],
          ["Full Name", viewingEmployee.fullName],
          ["Email", viewingEmployee.email],
          ["Phone", viewingEmployee.phone],
          ["Designation", viewingEmployee.designation],
          ["Department", viewingEmployee.department],
          ["Role", viewingEmployee.role],
          ["Joining Date", viewingEmployee.joiningDate],
          ["Status", viewingEmployee.status],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:justify-between"
          >
            <span className="text-sm text-slate-500">{label}</span>
            <span className="break-all text-sm font-medium text-slate-800">
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => setViewingEmployee(null)}
          className="rounded-lg border px-4 py-2 hover:bg-slate-50"
        >
          Close
        </button>
      </div>
    </section>
  </div>
        )}
      </main>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
