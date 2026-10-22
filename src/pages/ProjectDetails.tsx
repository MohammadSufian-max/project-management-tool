import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import Navbar from "../components/Navbar";
import { getProjects } from "../services/projectService";
import { getEmployees } from "../services/employeeService";
import { getTasks } from "../services/taskService";

import { useAuthStore } from "../store/authStore";

export default function ProjectDetails() {
  const { projectId } = useParams();
const user = useAuthStore((state) => state.user);
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const foundProject = projects.find(
  (item) => item.id === projectId
);

const hasProjectAccess =
  user?.role === "Super Admin" ||
  (user?.role === "Employee" &&
    !!user.employeeId &&
    !!foundProject?.teamMemberIds.includes(user.employeeId));

const project =
  foundProject && !foundProject.isArchived && hasProjectAccess
    ? foundProject
    : undefined;

  const manager = employees.find(
    (employee) => employee.id === project?.projectManagerId,
  );

  const teamMembers = useMemo(
    () =>
      employees.filter((employee) =>
        project?.teamMemberIds.includes(employee.id),
      ),
    [employees, project],
  );

  const projectTasks = tasks.filter(
    (task) => task.projectId === projectId,
  );

  const completedTasks = projectTasks.filter(
    (task) => task.status === "Done",
  ).length;

  const progress =
    projectTasks.length === 0
      ? 0
      : Math.round((completedTasks / projectTasks.length) * 100);

  const isLoading =
    projectsLoading || employeesLoading || tasksLoading;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </Link>

        {isLoading ? (
          <p className="text-slate-500">Loading project details...</p>
        ) : !project ? (
          <section className="rounded-xl border bg-white p-6">
            <h1 className="text-xl font-bold">Project not found</h1>
            <p className="mt-2 text-slate-500">
              This project may have been removed or the URL is incorrect.
            </p>
          </section>
        ) : (
          <>
            <section className="rounded-xl border bg-white p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <p className="text-sm text-slate-500">
                    Project ID: {project.id}
                  </p>
                  <h1 className="mt-1 text-3xl font-bold text-slate-900">
                    {project.name}
                  </h1>
                  <p className="mt-3 text-slate-600">
                    {project.description}
                  </p>
                </div>

                <span className="h-fit w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  {project.status}
                </span>
              </div>

              <div className="mt-6 grid gap-5 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">
                <Detail label="Project Manager" value={manager?.fullName ?? "Unknown"} />
                <Detail label="Start Date" value={project.startDate} />
                <Detail label="End Date" value={project.endDate} />
                <Detail label="Team Members" value={String(project.teamMemberIds.length)} />
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    Progress
                  </span>
                  <span className="text-slate-600">{progress}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border bg-white p-6">
              <h2 className="text-xl font-semibold">Team Members</h2>

              {teamMembers.length === 0 ? (
                <p className="mt-4 text-slate-500">
                  No team members assigned to this project.
                </p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {teamMembers.map((employee) => (
                    <div
                      key={employee.id}
                      className="rounded-lg border p-4"
                    >
                      <p className="font-medium text-slate-800">
                        {employee.fullName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {employee.designation}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {employee.email}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {employee.status}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-xl border bg-white">
              <div className="border-b p-6">
                <h2 className="text-xl font-semibold">Project Tasks</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tasks belonging to this project.
                </p>
              </div>

              {projectTasks.length === 0 ? (
                <p className="p-6 text-slate-500">
                  No tasks have been created for this project.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-5 py-4 font-medium">Task</th>
                        <th className="px-5 py-4 font-medium">Assignee</th>
                        <th className="px-5 py-4 font-medium">Priority</th>
                        <th className="px-5 py-4 font-medium">Due Date</th>
                        <th className="px-5 py-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectTasks.map((task) => {
                        const assignee = employees.find(
                          (employee) => employee.id === task.assigneeId,
                        );

                        return (
                          <tr key={task.id} className="border-t">
                            <td className="px-5 py-4">
                              <p className="font-medium">{task.title}</p>
                              <p className="mt-1 text-slate-500">
                                {task.description}
                              </p>
                            </td>
                            <td className="px-5 py-4">
                              {assignee?.fullName ?? "Unknown"}
                            </td>
                            <td className="px-5 py-4">{task.priority}</td>
                            <td className="whitespace-nowrap px-5 py-4">
                              {task.dueDate}
                            </td>
                            <td className="px-5 py-4">{task.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-800">{value}</p>
    </div>
  );
}