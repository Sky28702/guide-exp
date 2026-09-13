"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { signupUser } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Prevent logged-in users from accessing signup
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {
      router.replace("/");
    }
  }, [router]);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("employeeId", data.employeeId);
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await signupUser(formData);

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      // Account created successfully
      reset();

      // Redirect to login
      router.replace("/login");
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
        <h1 className="text-3xl font-bold">Sign Up</h1>

        <p className="mt-2 text-gray-500">Create your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div>
          <label className="mb-2 block font-medium">
            Name (first and last)
          </label>

          <input
            type="text"
            placeholder="John Doe"
            {...register("name", {
              required: "Name is required",
            })}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
          />

          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
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

        {/* Password */}
        <div>
          <label className="mb-2 block font-medium">Password</label>

          <input
            type="password"
            placeholder="••••••••"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
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
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
