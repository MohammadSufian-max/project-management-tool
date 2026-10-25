
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  UserRound,
  LayoutDashboard,
  Users,
  FolderKanban,
  ListTodo,
  UserCircle,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const navLinks = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Employees", path: "/employees", icon: Users, adminOnly: true },
    { label: "Projects", path: "/projects", icon: FolderKanban },
    { label: "Tasks", path: "/tasks", icon: ListTodo },
    { label: "Profile", path: "/profile", icon: UserCircle },
  ];

  const visibleLinks = navLinks.filter(
    (link) => !link.adminOnly || user?.role === "Super Admin"
  );

  return (
    <header className="border-b bg-white">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="text-left"
        >
          <h1 className="text-xl font-bold text-slate-900">ProjectFlow</h1>
          <p className="text-sm text-slate-500">Project Management Tool</p>
        </button>

        <nav
          aria-label="Main navigation"
          className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:w-auto lg:flex-nowrap"
        >
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <button
                key={link.path}
                type="button"
                onClick={() => navigate(link.path)}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition sm:justify-start ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={17} className="shrink-0" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:justify-start">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {user?.email ?? "Guest"}
            </p>
            <p className="text-xs text-slate-500">
              {user?.role ?? "Not signed in"}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <UserRound size={20} />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
