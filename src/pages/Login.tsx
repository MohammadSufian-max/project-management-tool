import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "../schemas/loginSchema";
import { login } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@demo.com",
      password: "Admin@123",
    },
  });

  async function handleLogin(values: LoginFormValues) {
    setError("");
    setLoading(true);

    try {
      const user = await login(values.email, values.password);
      setUser(user);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-slate-900 p-10 text-white md:flex">
          <div>
            <div className="mb-10 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500 p-2">
                <LockKeyhole size={24} />
              </div>
              <span className="text-xl font-bold">ProjectFlow</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight">
              Manage projects.
              <br />
              Empower teams.
            </h1>

            <p className="mt-5 leading-7 text-slate-300">
              Keep projects, tasks, and team members organized in one place.
            </p>
          </div>

          <p className="text-sm text-slate-400">Project Management Tool</p>
        </div>

        <div className="p-6 sm:p-10">
          <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter your credentials to access your account.
          </p>

          <form onSubmit={handleSubmit(handleLogin)} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-3 focus-within:border-blue-500">
                <Mail size={18} className="text-slate-400" />

                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  {...register("email")}
                  aria-invalid={Boolean(errors.email)}
                  placeholder="you@example.com"
                  className="w-full py-3 outline-none"
                />
              </div>
              {errors.email && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-3 focus-within:border-blue-500">
                <LockKeyhole size={18} className="text-slate-400" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  aria-invalid={Boolean(errors.password)}
                  placeholder="Enter your password"
                  className="w-full py-3 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="text-slate-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm">
            <p className="mb-2 font-semibold text-slate-700">
              Demo credentials
            </p>
            <p className="text-slate-600">Admin: admin@demo.com</p>
            <p className="text-slate-600">Password: Admin@123</p>
            <div className="my-3 border-t border-slate-200" />
            <p className="text-slate-600">Employee: employee@demo.com</p>
            <p className="text-slate-600">Password: Employee@123</p>
          </div>
        </div>
      </section>
    </main>
  );
}
