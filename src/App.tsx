import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";

import ProjectDetails from "./pages/ProjectDetails";

function NotFoundPage() {
  return <h1>404 - Page Not Found</h1>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />

        <Route
  path="/projects/:projectId"
  element={<ProjectDetails />}
/>

        <Route path="/tasks" element={<Tasks />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["Super Admin"]} />}>
        <Route path="/employees" element={<Employees />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
