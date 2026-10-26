import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FolderKanban, Plus, Search, Pencil, X } from "lucide-react";

import {
  getProjects,
  createProject,
  updateProject,
  archiveProject,
} from "../services/projectService";

import { getEmployees } from "../services/employeeService";
import { useAuthStore } from "../store/authStore";
import Navbar from "../components/Navbar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "../components/ui/pagination";
import type { Employee, Project } from "../types";

import { getTasks } from "../services/taskService";

import { useNavigate } from "react-router-dom";
import { Eye, Archive } from "lucide-react";

const projectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Project name must have at least 3 characters.")
      .max(100, "Project name cannot exceed 100 characters."),

    description: z
      .string()
      .trim()
      .min(1, "Description is required.")
      .max(500, "Description cannot exceed 500 characters."),

    projectManagerId: z.string().min(1, "Select a Project Manager."),
    teamMemberIds: z
      .array(z.string())
      .min(1, "Select at least one team member."),

    startDate: z
      .string()
      .trim()
      .min(1, "Start date is required.")
      .refine((value) => {
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
      }, "Enter a valid start date."),

    endDate: z
      .string()
      .trim()
      .min(1, "End date is required.")
      .refine((value) => {
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
      }, "Enter a valid end date."),

    status: z.enum(["Planned", "In Progress", "On Hold", "Completed"]),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be before start date.",
    path: ["endDate"],
  });

type ProjectFormValues = z.infer<typeof projectSchema>;

const emptyValues: ProjectFormValues = {
  name: "",
  description: "",
  projectManagerId: "",
  teamMemberIds: [],
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  status: "Planned",
};

export default function Projects() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formError, setFormError] = useState("");

  const {
    data: projects = [],
    isLoading: projectsLoading,
    isError: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active",
  );

  const managers = activeEmployees.filter(
    (employee) => employee.role === "Project Manager",
  );

  const saveMutation = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const project: Project = {
        ...values,
        id: editingProject?.id ?? `proj-${crypto.randomUUID()}`,
        createdAt: editingProject?.createdAt ?? new Date().toISOString(),
      };

      return editingProject ? updateProject(project) : createProject(project);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowForm(false);
      setEditingProject(null);
      setFormError("");
      form.reset(emptyValues);
    },
    onError: (error: Error) => {
      setFormError(error.message || "Unable to save project.");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: archiveProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error: Error) => {
      window.alert(error.message || "Unable to archive project.");
    },
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: emptyValues,
  });

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      // Archived projects list mein nahi dikhane
      if (project.isArchived) {
        return false;
      }

      // Employee ko sirf apni team ke assigned projects dikhane
      if (
        user?.role === "Employee" &&
        (!user.employeeId || !project.teamMemberIds.includes(user.employeeId))
      ) {
        return false;
      }

      const manager = employees.find(
        (employee) => employee.id === project.projectManagerId,
      );

      return [
        project.name,
        project.description,
        project.status,
        manager?.fullName ?? "",
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [projects, employees, search, user]);

  const totalPages = Math.ceil(filteredProjects.length / pageSize);

  const visiblePage = Math.min(currentPage, Math.max(totalPages, 1));

  const paginatedProjects = useMemo(() => {
    const startIndex = (visiblePage - 1) * pageSize;

    return filteredProjects.slice(startIndex, startIndex + pageSize);
  }, [filteredProjects, visiblePage]);

  function openAddForm() {
    setEditingProject(null);
    setFormError("");
    form.reset(emptyValues);
    setShowForm(true);
  }

  function openEditForm(project: Project) {
    setEditingProject(project);
    setFormError("");
    form.reset({
      name: project.name,
      description: project.description,
      projectManagerId: project.projectManagerId,
      teamMemberIds: project.teamMemberIds,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
    });
    setShowForm(true);
  }

  function onSubmit(values: ProjectFormValues) {
    setFormError("");
    saveMutation.mutate(values);
  }

  function getProjectProgress(projectId: string) {
    const project = filteredProjects.find((item) => item.id === projectId);

    if (project?.status === "Completed") return 100;

    const projectTasks = tasks.filter((task) => task.projectId === projectId);

    if (projectTasks.length === 0) return 0;

    const completedTasks = projectTasks.filter(
      (task) => task.status === "Done",
    ).length;

    return Math.round((completedTasks / projectTasks.length) * 100);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
            <p className="mt-2 text-slate-500">
              Create projects and manage teams.
            </p>
          </div>

          {user?.role === "Super Admin" && (
            <button
              type="button"
              onClick={openAddForm}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Project
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Projects" value={projects.length} />
          <StatCard
            label="In Progress"
            value={
              projects.filter((project) => project.status === "In Progress")
                .length
            }
          />
          <StatCard
            label="Completed"
            value={
              projects.filter((project) => project.status === "Completed")
                .length
            }
          />
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
                placeholder="Search projects or manager..."
                className="w-full rounded-lg border py-3 pl-10 pr-4 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {projectsLoading || employeesLoading ? (
            <p className="p-6 text-slate-500">Loading projects...</p>
          ) : projectsError ? (
            <p className="p-6 text-red-600">Could not load projects.</p>
          ) : filteredProjects.length === 0 ? (
            <p className="p-6 text-slate-500">No projects found.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[1000px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-5 py-4 font-medium">Project ID</th>
                        <th className="px-5 py-4 font-medium">Project Name</th>
                        <th className="px-5 py-4 font-medium">
                          Project Manager
                        </th>
                        <th className="px-5 py-4 font-medium">Team Members</th>
                        <th className="px-5 py-4 font-medium">Start Date</th>
                        <th className="px-5 py-4 font-medium">End Date</th>
                        <th className="px-5 py-4 font-medium">Status</th>
                        <th className="px-5 py-4 font-medium">Progress</th>
                        <th className="px-5 py-4 font-medium">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedProjects.map((project) => {
                        const manager = employees.find(
                          (employee) =>
                            employee.id === project.projectManagerId,
                        );

                        const progress = getProjectProgress(project.id);

                        return (
                          <tr
                            key={project.id}
                            className="border-t hover:bg-slate-50"
                          >
                            <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                              {project.id}
                            </td>

                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-800">
                                {project.name}
                              </p>
                              <p className="mt-1 max-w-xs truncate text-slate-500">
                                {project.description}
                              </p>
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              {manager?.fullName ?? "Unknown"}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              {project.teamMemberIds.length}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              {project.startDate}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              {project.endDate}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                {project.status}
                              </span>
                            </td>

                            <td className="min-w-36 px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full rounded-full bg-blue-600"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-600">
                                  {progress}%
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(`/projects/${project.id}`)
                                  }
                                  title="View project"
                                  aria-label={`View ${project.name}`}
                                  className="text-slate-600 hover:text-blue-600"
                                >
                                  <Eye size={18} />
                                </button>

                                {user?.role === "Super Admin" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openEditForm(project)}
                                      title="Edit project"
                                      aria-label={`Edit ${project.name}`}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <Pencil size={18} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const confirmed = window.confirm(
                                          `Are you sure you want to archive "${project.name}"?`,
                                        );

                                        if (confirmed) {
                                          archiveMutation.mutate(project.id);
                                        }
                                      }}
                                      disabled={
                                        archiveMutation.isPending ||
                                        project.isArchived
                                      }
                                      title={
                                        project.isArchived
                                          ? "Project archived"
                                          : "Archive project"
                                      }
                                      aria-label={`Archive ${project.name}`}
                                      className="text-slate-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      <Archive size={18} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 border-t px-4 py-4">
                <p className="text-center text-sm text-slate-500">
                  Showing {(visiblePage - 1) * pageSize + 1} to{" "}
                  {Math.min(visiblePage * pageSize, filteredProjects.length)} of{" "}
                  {filteredProjects.length} projects
                </p>

                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent className="flex-wrap">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((page) => Math.max(1, page - 1))
                          }
                          disabled={visiblePage === 1}
                        />
                      </PaginationItem>

                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1,
                      ).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={visiblePage === page}
                            onClick={() => setCurrentPage(page)}
                            aria-label={`Go to page ${page}`}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((page) =>
                              Math.min(totalPages, page + 1),
                            )
                          }
                          disabled={visiblePage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </>
          )}
        </section>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-3 sm:p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-form-title"
              className="my-3 w-full max-w-2xl rounded-2xl bg-white p-4 shadow-xl sm:my-6 sm:p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 id="project-form-title" className="text-xl font-bold">
                    {editingProject ? "Edit Project" : "Create Project"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter project details and choose its team.
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

              {managers.length === 0 && (
                <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  No active Project Manager found. Add or activate a Project
                  Manager in Employee Onboarding first.
                </p>
              )}

              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Project Name
                  </label>
                  <input
                    {...form.register("name")}
                    className="form-input"
                    placeholder="e.g. Customer Portal"
                  />
                  <FieldError message={form.formState.errors.name?.message} />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    {...form.register("description")}
                    rows={3}
                    className="form-input"
                    placeholder="Describe the project..."
                  />
                  <FieldError
                    message={form.formState.errors.description?.message}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Project Manager
                  </label>
                  <select
                    {...form.register("projectManagerId")}
                    className="form-input"
                  >
                    <option value="">Select a manager</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.fullName} — {manager.email}
                      </option>
                    ))}
                  </select>
                  <FieldError
                    message={form.formState.errors.projectManagerId?.message}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Team Members
                  </label>
                  <p className="mb-2 text-xs text-slate-500">
                    Select the active employees assigned to this project. The
                    manager is not automatically a team member.
                  </p>

                  <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border p-3">
                    {activeEmployees.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No active employees available.
                      </p>
                    ) : (
                      activeEmployees.map((employee: Employee) => (
                        <label
                          key={employee.id}
                          className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={form
                              .watch("teamMemberIds")
                              .includes(employee.id)}
                            onChange={(event) => {
                              const current = form.getValues("teamMemberIds");
                              form.setValue(
                                "teamMemberIds",
                                event.target.checked
                                  ? [...current, employee.id]
                                  : current.filter((id) => id !== employee.id),
                                { shouldValidate: true },
                              );
                            }}
                          />
                          <span>
                            <span className="block text-sm font-medium">
                              {employee.fullName}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {employee.designation} · {employee.role}
                            </span>
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  <FieldError
                    message={form.formState.errors.teamMemberIds?.message}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Start Date
                    </label>
                    <input
                      {...form.register("startDate")}
                      type="date"
                      className="form-input"
                    />
                    <FieldError
                      message={form.formState.errors.startDate?.message}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      End Date
                    </label>
                    <input
                      {...form.register("endDate")}
                      type="date"
                      className="form-input"
                    />
                    <FieldError
                      message={form.formState.errors.endDate?.message}
                    />
                    <FieldError message={form.formState.errors.root?.message} />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Status
                  </label>
                  <select {...form.register("status")} className="form-input">
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {formError && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                  >
                    {formError}
                  </p>
                )}

                <div className="flex justify-end gap-3 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border px-4 py-2 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending || managers.length === 0}
                    className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saveMutation.isPending
                      ? "Saving..."
                      : editingProject
                        ? "Save Changes"
                        : "Create Project"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center gap-3 text-slate-500">
        <FolderKanban size={20} />
        {label}
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}
