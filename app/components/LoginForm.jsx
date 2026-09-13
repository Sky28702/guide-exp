"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/actions/auth";

export default function LoginForm() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {
      router.replace("/");
    }
  }, [router]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("email", data.email);
      formData.append("employeeId", data.employeeId);
      formData.append("password", data.password);

      const result = await loginUser(formData);

      // Login failed
      if (!result.success) {
        setMessage(result.message);
        return;
      }

      // Login succeeded
      localStorage.setItem("authUser", JSON.stringify(result.user));
      localStorage.setItem("isLoggedIn", "true");

      // Redirect to homepage
      router.push("/");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Login</h1>

        <p className="mt-2 text-gray-500">Login to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="mb-2 block font-medium">E-mail</label>

          <input
            type="email"
            placeholder="john@example.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Enter a valid email address",
              },
            })}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Employee ID */}
        <div>
          <label className="mb-2 block font-medium">Employee ID</label>

          <input
            type="text"
            placeholder="EMP001"
            {...register("employeeId", {
              required: "Employee ID is required",
            })}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
          />

          {errors.employeeId && (
            <p className="mt-1 text-sm text-red-500">
              {errors.employeeId.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block font-medium">Password</label>

          <input
            type="password"
            placeholder="••••••••"
            {...register("password", {
              required: "Password is required",
            })}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
          />

          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Message */}
        {message && (
          <p className="rounded-xl bg-gray-100 px-4 py-3 text-sm">{message}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
