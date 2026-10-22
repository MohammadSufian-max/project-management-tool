import { useQuery } from "@tanstack/react-query";
import {
  FolderKanban,
  ListTodo,
  CheckCircle2,
  Users,
  Clock3,
  CircleAlert,
  CalendarClock,
} from "lucide-react";

import { getProjects } from "../services/projectService";
import { getTasks } from "../services/taskService";
import { getEmployees } from "../services/employeeService";
import { useAuthStore } from "../store/authStore";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "Super Admin";
  const employeeId = user?.employeeId;

  const {
    data: allProjects = [],
    isLoading: projectsLoading,
    isError: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const {
    data: allTasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const {
    data: employees = [],
    isLoading: employeesLoading,
    isError: employeesError,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
    enabled: isAdmin,
  });

  const today = new Date().toISOString().slice(0, 10);

  const visibleTasks = isAdmin
    ? allTasks
    : allTasks.filter((task) => task.assigneeId === employeeId);

  const nonArchivedProjects = allProjects.filter(
    (project) => !project.isArchived,
  );

  const visibleProjects = isAdmin
    ? nonArchivedProjects
    : nonArchivedProjects.filter(
        (project) =>
          Boolean(employeeId && project.teamMemberIds.includes(employeeId)) ||
          visibleTasks.some((task) => task.projectId === project.id),
      );

  const completedTasks = visibleTasks.filter(
    (task) => task.status === "Done",
  ).length;

  const toDoTasks = visibleTasks.filter(
    (task) => task.status === "To Do",
  ).length;

  const inProgressTasks = visibleTasks.filter(
    (task) => task.status === "In Progress",
  ).length;

  const overdueTasks = visibleTasks.filter(
    (task) => task.status !== "Done" && task.dueDate < today,
  ).length;

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active",
  ).length;

  const activeProjects = nonArchivedProjects.filter(
    (project) => project.status === "In Progress",
  ).length;

  const isLoading =
    projectsLoading || tasksLoading || (isAdmin && employeesLoading);

  const hasError = projectsError || tasksError || (isAdmin && employeesError);

  const stats = isAdmin
    ? [
        { title: "Total Employees", value: employees.length, icon: Users },
        { title: "Active Employees", value: activeEmployees, icon: Users },
        {
          title: "Total Projects",
          value: allProjects.length,
          icon: FolderKanban,
        },
        { title: "Active Projects", value: activeProjects, icon: FolderKanban },
        { title: "Total Tasks", value: allTasks.length, icon: ListTodo },
        { title: "To Do Tasks", value: toDoTasks, icon: ListTodo },
        { title: "In Progress Tasks", value: inProgressTasks, icon: Clock3 },
        { title: "Completed Tasks", value: completedTasks, icon: CheckCircle2 },
        { title: "Overdue Tasks", value: overdueTasks, icon: CircleAlert },
      ]
    : [
        {
          title: "My Projects",
          value: visibleProjects.length,
          icon: FolderKanban,
        },
        {
          title: "My Assigned Tasks",
          value: visibleTasks.length,
          icon: ListTodo,
        },
        { title: "My To Do Tasks", value: toDoTasks, icon: ListTodo },
        { title: "My In Progress", value: inProgressTasks, icon: Clock3 },
        {
          title: "My Completed Tasks",
          value: completedTasks,
          icon: CheckCircle2,
        },
        { title: "My Overdue Tasks", value: overdueTasks, icon: CircleAlert },
      ];

  function getProjectProgress(projectId: string) {
    const projectTasks = allTasks.filter(
      (task) => task.projectId === projectId,
    );

    if (projectTasks.length === 0) return 0;

    const completed = projectTasks.filter(
      (task) => task.status === "Done",
    ).length;

    return Math.round((completed / projectTasks.length) * 100);
  }

  const upcomingTasks = visibleTasks
    .filter((task) => task.status !== "Done" && task.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  function getEmployeeName(employeeIdToFind: string) {
    return (
      employees.find((employee) => employee.id === employeeIdToFind)
        ?.fullName ?? "Unknown employee"
    );
  }

  function getProjectName(projectId: string) {
    return (
      allProjects.find((project) => project.id === projectId)?.name ??
      "Unknown project"
    );
  }

  function getProjectManagerName(projectManagerId: string) {
    return (
      employees.find((employee) => employee.id === projectManagerId)
        ?.fullName ?? "Unknown manager"
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-8 p-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-slate-500">
            {isAdmin
              ? "Overview of employees, projects and task progress."
              : "Overview of your assigned tasks, progress and deadlines."}
          </p>
        </div>

        {hasError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Could not load dashboard data. Please refresh the page.
          </div>
        )}

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <Icon size={21} />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-900">
                  {isLoading ? "..." : stat.value}
                </p>
              </div>
            );
          })}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            {isAdmin ? "Recent Projects" : "My Projects"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin
              ? "Project status, team size and calculated progress."
              : "Projects connected to your team membership or assigned tasks."}
          </p>

          {projectsLoading || tasksLoading ? (
            <p className="mt-6 text-slate-500">Loading projects...</p>
          ) : projectsError || tasksError ? (
            <p role="alert" className="mt-6 text-red-600">
              Could not load projects. Please try again.
            </p>
          ) : visibleProjects.length === 0 ? (
            <p className="mt-6 text-slate-500">No projects available.</p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="px-3 py-3 font-medium">Project</th>
                    <th className="px-3 py-3 font-medium">Project Manager</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Team Size</th>
                    <th className="px-3 py-3 font-medium">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProjects.slice(0, 5).map((project) => {
                    const progress = getProjectProgress(project.id);

                    return (
                      <tr
                        key={project.id}
                        className="border-b last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-3 py-4 font-medium text-slate-800">
                          {project.name}
                        </td>
                        <td className="px-3 py-4 text-slate-600">
                          {getProjectManagerName(project.projectManagerId)}
                        </td>
                        <td className="px-3 py-4">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            {project.status}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-slate-600">
                          {project.teamMemberIds.length} members
                        </td>
                        <td className="min-w-36 px-3 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            {isAdmin ? "Recent Tasks" : "My Assigned Tasks"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Task assignments, priorities and deadlines.
          </p>

          {tasksLoading ? (
            <p className="mt-6 text-slate-500">Loading tasks...</p>
          ) : tasksError ? (
            <p role="alert" className="mt-6 text-red-600">
              Could not load tasks. Please try again.
            </p>
          ) : visibleTasks.length === 0 ? (
            <p className="mt-6 text-slate-500">No tasks available.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {visibleTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col justify-between gap-3 rounded-lg border border-slate-100 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-medium text-slate-800">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Project: {getProjectName(task.projectId)}
                    </p>
                    {isAdmin && (
                      <p className="mt-1 text-sm text-slate-500">
                        Assignee: {getEmployeeName(task.assigneeId)}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-slate-500">
                      Due: {task.dueDate}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      {task.priority}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {task.status}
                    </span>
                    {task.status !== "Done" && task.dueDate < today && (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {!isAdmin && (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <CalendarClock size={21} className="text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                Upcoming Deadlines
              </h2>
            </div>

            {tasksLoading ? (
              <p className="mt-5 text-slate-500">Loading deadlines...</p>
            ) : upcomingTasks.length === 0 ? (
              <p className="mt-5 text-slate-500">No upcoming task deadlines.</p>
            ) : (
              <div className="mt-5 space-y-3">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col justify-between gap-2 rounded-lg border border-slate-100 p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {getProjectName(task.projectId)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-slate-600">
                      Due: {task.dueDate}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
