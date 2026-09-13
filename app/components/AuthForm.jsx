"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { loginUser, signupUser } from "@/app/actions/auth";

export default function AuthForm() {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");

    try {
      // ==========================
      // LOGIN
      // ==========================

      if (mode === "login") {
        const formData = new FormData();

        formData.append("email", data.email);
        formData.append("employeeId", data.employeeId);
        formData.append("password", data.password);

        const result = await loginUser(formData);

        if (!result.success) {
          setMessage(result.message);
          return;
        }

        // Save only safe user information
        localStorage.setItem("authUser", JSON.stringify(result.user));

        localStorage.setItem("isLoggedIn", "true");

        setMessage("Login successful!");

        console.log("Logged in user:", result.user);

        // Example:
        // window.location.href = "/dashboard";
      }

      // ==========================
      // SIGN UP
      // ==========================
      else {
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

        setMessage("Account created successfully!");

        // Clear form
        reset();

        // Switch to login
        setMode("login");
      }
    } catch (error) {
      console.error(error);

      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* ==========================
          SWITCH LOGIN / SIGNUP
      =========================== */}

      <div className="flex mb-8 rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setMessage("");
            reset();
          }}
          className={`flex-1 py-3 rounded-lg font-medium transition ${
            mode === "login" ? "bg-white shadow text-black" : "text-gray-500"
          }`}
        >
          Login
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setMessage("");
            reset();
          }}
          className={`flex-1 py-3 rounded-lg font-medium transition ${
            mode === "signup" ? "bg-white shadow text-black" : "text-gray-500"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* ==========================
          FORM
      =========================== */}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* NAME - SIGNUP ONLY */}

        {mode === "signup" && (
          <div>
            <label className="block mb-2 font-medium">
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
        )}

        {/* EMPLOYEE ID */}

        <div>
          <label className="block mb-2 font-medium">Employee ID</label>

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

        {/* EMAIL */}

        <div>
          <label className="block mb-2 font-medium">E-mail</label>

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

        {/* PASSWORD */}

        <div>
          <label className="block mb-2 font-medium">Password</label>

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

        {/* MESSAGE */}

        {message && (
          <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        {/* SUBMIT */}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Login"
              : "Create Account"}
        </button>
      </form>
    </div>
  );
}
