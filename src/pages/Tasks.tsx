
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ListTodo, Pencil, Plus, Search, Trash2, X } from "lucide-react";

import { getTasks, createTask, updateTask, deleteTask } from "../services/taskService";
import { getProjects } from "../services/projectService";
import { getEmployees } from "../services/employeeService";
import { useAuthStore } from "../store/authStore";
import Navbar from "../components/Navbar";
import type { Project, Task } from "../types";

const taskSchema = z.object({
  title: z.string().trim().min(3, "Title must have at least 3 characters."),
  description: z.string().trim().min(5, "Description must have at least 5 characters."),
  projectId: z.string().min(1, "Select a project."),
  assigneeId: z.string().min(1, "Select a team member."),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["To Do", "In Progress", "Done"]),
  startDate: z.string().min(1, "Start date is required."),
  dueDate: z.string().min(1, "Due date is required."),
}).refine((data) => data.dueDate >= data.startDate, {
  message: "Due date cannot be before start date.",
  path: ["dueDate"],
});

type TaskFormValues = z.infer<typeof taskSchema>;

const emptyValues: TaskFormValues = {
  title: "",
  description: "",
  projectId: "",
  assigneeId: "",
  priority: "Medium",
  status: "To Do",
  startDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
};

export default function Tasks() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formError, setFormError] = useState("");
  const [statusTask, setStatusTask] = useState<Task | null>(null);
  const [nextStatus, setNextStatus] = useState<Task["status"]>("To Do");

  const { data: tasks = [], isLoading: tasksLoading, isError: tasksError } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const isAdmin = user?.role === "Super Admin";
  const currentEmployeeId = user?.employeeId;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: emptyValues,
  });

  const selectedProjectId = form.watch("projectId");
  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  const eligibleAssignees = employees.filter(
    (employee) =>
      employee.status === "Active" &&
      Boolean(selectedProject?.teamMemberIds.includes(employee.id))
  );

  const saveMutation = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      const task: Task = {
        ...values,
        id: editingTask?.id ?? `task-${crypto.randomUUID()}`,
        createdAt: editingTask?.createdAt ?? new Date().toISOString(),
      };

      return editingTask ? updateTask(task) : createTask(task);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowForm(false);
      setEditingTask(null);
      setFormError("");
      form.reset(emptyValues);
    },
    onError: (error: Error) => setFormError(error.message || "Unable to save task."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ task, status }: { task: Task; status: Task["status"] }) => {
      if (!currentEmployeeId || task.assigneeId !== currentEmployeeId) {
        throw new Error("You can update only your own tasks.");
      }

      return updateTask({ ...task, status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const visibleTasks = useMemo(() => {
    const roleTasks = isAdmin
      ? tasks
      : tasks.filter((task) => task.assigneeId === currentEmployeeId);

    const query = search.trim().toLowerCase();

    return roleTasks.filter((task) => {
      const project = projects.find((item) => item.id === task.projectId);
      const assignee = employees.find((item) => item.id === task.assigneeId);

      return [
        task.title,
        task.description,
        task.status,
        task.priority,
        project?.name ?? "",
        assignee?.fullName ?? "",
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [tasks, projects, employees, isAdmin, currentEmployeeId, search]);

  function openAddForm() {
    setEditingTask(null);
    setFormError("");
    form.reset(emptyValues);
    setShowForm(true);
  }

  function openEditForm(task: Task) {
    setEditingTask(task);
    setFormError("");
    form.reset({
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      priority: task.priority,
      status: task.status,
      startDate: task.startDate,
      dueDate: task.dueDate,
    });
    setShowForm(true);
  }

  function handleProjectChange(projectId: string) {
    form.setValue("projectId", projectId, { shouldValidate: true });

    const project = projects.find((item) => item.id === projectId);
    const currentAssigneeId = form.getValues("assigneeId");

    if (!project?.teamMemberIds.includes(currentAssigneeId)) {
      form.setValue("assigneeId", "", { shouldValidate: true });
    }

    if (project) {
      const startDate = form.getValues("startDate");
      const dueDate = form.getValues("dueDate");

      if (startDate && (startDate < project.startDate || startDate > project.endDate)) {
        form.setValue("startDate", project.startDate);
      }

      if (dueDate && (dueDate < project.startDate || dueDate > project.endDate)) {
        form.setValue("dueDate", "");
      }
    }
  }

  function onSubmit(values: TaskFormValues) {
    setFormError("");

    if (!selectedProjectId) {
      setFormError("Select a project first.");
      return;
    }

    const project = projects.find((item) => item.id === values.projectId);

    if (!project) {
      setFormError("Selected project does not exist.");
      return;
    }

    if (
      values.startDate < project.startDate ||
      values.startDate > project.endDate ||
      values.dueDate < values.startDate ||
      values.dueDate > project.endDate
    ) {
      setFormError("Task dates must fall within the selected project's timeline.");
      return;
    }

    if (!project.teamMemberIds.includes(values.assigneeId)) {
      setFormError("Assignee must belong to the selected project's team.");
      return;
    }

    saveMutation.mutate(values);
  }

  const isLoading = tasksLoading || projectsLoading || employeesLoading;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Task Management</h1>
            <p className="mt-2 text-slate-500">
              {isAdmin ? "Create and manage project tasks." : "View your assigned tasks and update their status."}
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={openAddForm}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Task
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Visible Tasks" value={visibleTasks.length} />
          <StatCard
            label="In Progress"
            value={visibleTasks.filter((task) => task.status === "In Progress").length}
          />
          <StatCard
            label="Completed"
            value={visibleTasks.filter((task) => task.status === "Done").length}
          />
        </div>

        <section className="overflow-hidden rounded-xl border bg-white">
          <div className="border-b p-4">
            <div className="relative max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks, projects or assignees..."
                className="w-full rounded-lg border py-3 pl-10 pr-4 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {isLoading ? (
            <p className="p-6 text-slate-500">Loading tasks...</p>
          ) : tasksError ? (
            <p className="p-6 text-red-600">Could not load tasks.</p>
          ) : visibleTasks.length === 0 ? (
            <p className="p-6 text-slate-500">No matching tasks found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Task</th>
                    <th className="px-5 py-4 font-medium">Project</th>
                    <th className="px-5 py-4 font-medium">Assignee</th>
                    <th className="px-5 py-4 font-medium">Priority</th>
                    <th className="px-5 py-4 font-medium">Due Date</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTasks.map((task) => {
                    const project = projects.find((item) => item.id === task.projectId);
                    const assignee = employees.find((item) => item.id === task.assigneeId);
                    const isOwnTask = task.assigneeId === currentEmployeeId;

                    return (
                      <tr key={task.id} className="border-t hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">{task.title}</p>
                          <p className="mt-1 max-w-xs truncate text-slate-500">{task.description}</p>
                        </td>
                        <td className="px-5 py-4">{project?.name ?? "Unknown"}</td>
                        <td className="px-5 py-4">{assignee?.fullName ?? "Unknown"}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                            task.priority === "High"
                              ? "bg-red-50 text-red-700"
                              : task.priority === "Medium"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-green-50 text-green-700"
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">{task.dueDate}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {task.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {isAdmin ? (
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => openEditForm(task)}
                                title="Edit task"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                type="button"
                                disabled={deleteMutation.isPending}
                                onClick={() => {
                                  if (window.confirm(`Delete task "${task.title}"?`)) {
                                    deleteMutation.mutate(task.id);
                                  }
                                }}
                                title="Delete task"
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ) : isOwnTask ? (
                            <button
                              type="button"
                              onClick={() => {
                                setStatusTask(task);
                                setNextStatus(task.status);
                              }}
                              className="text-blue-600 underline"
                            >
                              Update status
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {showForm && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
            <section role="dialog" aria-modal="true" aria-labelledby="task-form-title" className="my-6 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 id="task-form-title" className="text-xl font-bold">
                    {editingTask ? "Edit Task" : "Create Task"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">Assign this task to a member of its project team.</p>
                </div>
                <button type="button" onClick={() => setShowForm(false)} aria-label="Close form" className="rounded-lg p-2 hover:bg-slate-100">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Task Title</label>
                  <input {...form.register("title")} className="form-input" placeholder="e.g. Build login page" />
                  <FieldError message={form.formState.errors.title?.message} />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Description</label>
                  <textarea {...form.register("description")} rows={3} className="form-input" placeholder="Describe the task..." />
                  <FieldError message={form.formState.errors.description?.message} />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Project</label>
                  <select
                    {...form.register("projectId")}
                    onChange={(event) => handleProjectChange(event.target.value)}
                    className="form-input"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project: Project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                  <FieldError message={form.formState.errors.projectId?.message} />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Assignee</label>
                  <select {...form.register("assigneeId")} className="form-input" disabled={!selectedProjectId}>
                    <option value="">Select a team member</option>
                    {eligibleAssignees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName} — {employee.designation}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    Only active members explicitly assigned to the selected project are shown.
                  </p>
                  <FieldError message={form.formState.errors.assigneeId?.message} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Priority</label>
                    <select {...form.register("priority")} className="form-input">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Status</label>
                    <select {...form.register("status")} className="form-input">
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Start Date</label>
                    <input {...form.register("startDate")} type="date" className="form-input" />
                    <FieldError message={form.formState.errors.startDate?.message} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Due Date</label>
                    <input {...form.register("dueDate")} type="date" className="form-input" />
                    <FieldError message={form.formState.errors.dueDate?.message} />
                  </div>
                </div>

                {formError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>}

                <div className="flex justify-end gap-3 border-t pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={saveMutation.isPending} className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                    {saveMutation.isPending ? "Saving..." : editingTask ? "Save Changes" : "Create Task"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {statusTask && !isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <section role="dialog" aria-modal="true" aria-labelledby="status-dialog-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h2 id="status-dialog-title" className="text-xl font-bold">Update Task Status</h2>
              <p className="mt-2 text-sm text-slate-500">{statusTask.title}</p>

              <label className="mb-1.5 mt-5 block text-sm font-medium">Status</label>
              <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value as Task["status"])} className="form-input">
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>

              {statusMutation.isError && <p role="alert" className="mt-3 text-sm text-red-600">{statusMutation.error.message}</p>}

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setStatusTask(null)} className="rounded-lg border px-4 py-2">Cancel</button>
                <button
                  type="button"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate({ task: statusTask, status: nextStatus }, {
                    onSuccess: () => setStatusTask(null),
                  })}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-60"
                >
                  {statusMutation.isPending ? "Saving..." : "Save Status"}
                </button>
              </div>
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
        <ListTodo size={20} />
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
