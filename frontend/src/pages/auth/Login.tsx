import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();

  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      toast.success("Login successful!");
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        {/* Heading */}
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="text-3xl font-bold text-blue-600"
          >
            Online Quiz Assessment
          </Link>

          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-slate-600">
            Login to continue your learning journey.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-medium text-slate-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-blue-600"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-blue-600"
              >
                {showPassword ? (
                  <HiOutlineEyeSlash size={22} />
                ) : (
                  <HiOutlineEye size={22} />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="font-medium text-blue-600 transition hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
