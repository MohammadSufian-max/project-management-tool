
export type EmployeeRole = "Employee" | "Project Manager";

export type AppRole = "Super Admin" | "Employee";

export type EmployeeStatus = "Active" | "Inactive";

export type ProjectStatus =
  | "Planned"
  | "In Progress"
  | "On Hold"
  | "Completed";

export type TaskPriority = "Low" | "Medium" | "High";

export type TaskStatus = "To Do" | "In Progress" | "Done";

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  department: "Engineering" | "Design" | "QA" | "Business" | "Other";
  role: EmployeeRole;
  joiningDate: string;
  status: EmployeeStatus;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  projectManagerId: string;
  teamMemberIds: string[];
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  createdAt: string;
  isArchived?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  createdAt: string;
}

export interface DemoUser {
  id: string;
  email: string;
  password: string;
  role: AppRole;
  employeeId?: string;
}
