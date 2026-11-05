import { AppDataSource } from "../config/database";
import { Employee } from "../entities/Employee";

// Employee repository
const employeeRepository = AppDataSource.getRepository(Employee);

// Employee input type
interface EmployeeInput {
  name: string;
  email: string;
  role: "Super Admin" | "Employee" | "Project Manager";
  phone?: string;
  designation?: string;
  department?: "Engineering" | "Design" | "QA" | "Business" | "Other";
  joiningDate?: string;
  status?: "Active" | "Inactive";
}

// GET: All employees
export const getAllEmployees = async () => {
  return await employeeRepository.find();
};

// GET: Employee by ID
export const getEmployeeById = async (id: string) => {
  return await employeeRepository.findOneBy({ id });
};

// POST: Create employee
export const createEmployee = async (data: EmployeeInput) => {
  // Prevent Super Admin creation
  if (data.role === "Super Admin") {
    throw new Error(
      "Super Admin cannot be created through employee onboarding"
    );
  }

  // Validate role
  if (!["Employee", "Project Manager"].includes(data.role)) {
    throw new Error("Invalid employee role");
  }

  // Check duplicate email
  const existingEmployee = await employeeRepository.findOne({
    where: { email: data.email },
  });

  if (existingEmployee) {
    throw new Error("Email already exists");
  }

  // Validate required fields
  if (
    !data.name?.trim() ||
    !data.email?.trim() ||
    !data.phone?.trim() ||
    !data.designation?.trim() ||
    !data.department ||
    !data.joiningDate
  ) {
    throw new Error("All required employee fields must be provided");
  }
  // Validate phone number (10 digits)
if (!/^[0-9]{10}$/.test(data.phone || "")) {
  throw new Error("Invalid phone number");
}
// Validate joining date
if (
  !data.joiningDate ||
  Number.isNaN(Date.parse(data.joiningDate)) ||
  !/^\d{4}-\d{2}-\d{2}$/.test(data.joiningDate)
) {
  throw new Error("Invalid joining date");
}

// Validate employee name
const trimmedName = data.name.trim();

if (trimmedName.length < 3 || trimmedName.length > 100) {
  throw new Error("Name must be between 3 and 100 characters");
}

data.name = trimmedName;

// Validate employee email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(data.email)) {
  throw new Error("Invalid email address");
}

data.email = data.email.trim().toLowerCase();

// Validate department
const allowedDepartments = [
  "Engineering",
  "Design",
  "QA",
  "Business",
  "Other",
];

if (!allowedDepartments.includes(data.department)) {
  throw new Error("Invalid department");
}

  const newEmployee = employeeRepository.create({
    id: `emp-${Date.now()}`,
    ...data,
  });

  return await employeeRepository.save(newEmployee);
};

// PUT: Update employee
export const updateEmployee = async (
  id: string,
  data: Partial<EmployeeInput>
) => {
  const employee = await employeeRepository.findOneBy({ id });

  if (!employee) return null;

  // Validate role
  if (
    data.role !== undefined &&
    !["Employee", "Project Manager"].includes(data.role)
  ) {
    throw new Error("Invalid role");
  }

  // Validate name
  if (data.name !== undefined) {
    const trimmedName = data.name.trim();

    if (trimmedName.length < 3 || trimmedName.length > 100) {
      throw new Error("Name must be between 3 and 100 characters");
    }

    data.name = trimmedName;
  }

  // Validate email
  if (data.email !== undefined) {
    const email = data.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      throw new Error("Invalid email address");
    }

    const existingEmail = await employeeRepository.findOneBy({ email });

    if (existingEmail && existingEmail.id !== id) {
      throw new Error("Email already exists");
    }

    data.email = email;
  }

  // Validate phone
  if (data.phone !== undefined && !/^[0-9]{10}$/.test(data.phone)) {
    throw new Error("Invalid phone number");
  }

  // Validate department
  if (
    data.department !== undefined &&
    !["Engineering", "Design", "QA", "Business", "Other"].includes(
      data.department
    )
  ) {
    throw new Error("Invalid department");
  }

  // Validate designation
if (
  data.designation !== undefined &&
  !data.designation.trim()
) {
  throw new Error("Designation is required");
}

if (data.designation !== undefined) {
  data.designation = data.designation.trim();
}

  // Validate joining date
  if (data.joiningDate !== undefined) {
    const date = data.joiningDate;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error("Invalid joining date");
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      throw new Error("Invalid joining date");
    }
  }

  // Validate status
if (
  data.status !== undefined &&
  !["Active", "Inactive"].includes(data.status)
) {
  throw new Error("Invalid status");
}

  Object.assign(employee, data);



  return await employeeRepository.save(employee);
};



// DEACTIVATE employee
export const deleteEmployee = async (id: string) => {
  const employee = await employeeRepository.findOneBy({ id });

  if (!employee) return null;

  employee.status = "Inactive";

  return await employeeRepository.save(employee);
};

// GET: All tasks assigned to a specific employee
export const getEmployeeTasks = async (employeeId: string) => {
  const employee = await employeeRepository.findOne({
    where: { id: employeeId },
    relations: {
      assignedTasks: {
        project: true,
      },
    },
  });

  if (!employee) return null;

  return employee.assignedTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    projectId: task.project.id,
    assigneeId: employee.id,
    priority: task.priority,
    status: task.status,
    startDate: task.startDate,
    dueDate: task.dueDate,
    createdAt: task.createdAt.toISOString(),
  }));
};