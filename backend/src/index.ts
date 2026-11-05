
import express from "express";
import cors from "cors";
import { seedAdmin } from "./seed/admin.seed";
import authRoutes from "./routes/auth.routes";
import employeeRoutes from "./routes/employee.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import { AppDataSource } from "./config/database";
import { seedEmployee } from "./seed/employee.seed";
import dashboardRoutes from "./routes/dashboard.routes";
import profileRoutes from "./routes/profile.routes";


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API is working",
  });
});

// Employee routes
app.use("/api/employees", employeeRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);


// Start server
const startServer = async () => {
  try {
    // Connect to MySQL database
    await AppDataSource.initialize();

    console.log("MySQL Database Connected Successfully!");

    // Create Super Admin if it does not exist
    await seedAdmin();
    await seedEmployee();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

startServer();

