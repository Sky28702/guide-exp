"use server";

import bcrypt from "bcryptjs";

import connectDB from "../lib/mongodb";
import User from "../models/User";

// ===============================
// SIGN UP
// ===============================

export async function signupUser(formData) {
  try {
    const name = formData.get("name")?.trim();
    const employeeId = formData.get("employeeId")?.trim();
    const email = formData.get("email")?.trim().toLowerCase();
    const password = formData.get("password");

    // Basic validation
    if (!name || !employeeId || !email || !password) {
      return {
        success: false,
        message: "All fields are required.",
      };
    }

    await connectDB();

    // Check existing employee ID
    const existingEmployee = await User.findOne({
      employeeId,
    });

    if (existingEmployee) {
      return {
        success: false,
        message: "Employee ID already exists.",
      };
    }

    // Check existing email
    const existingEmail = await User.findOne({
      email,
    });

    if (existingEmail) {
      return {
        success: false,
        message: "Email already exists.",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      employeeId,
      email,
      password: hashedPassword,
    });

    return {
      success: true,
      message: "Account created successfully.",

      user: {
        id: user._id.toString(),
        name: user.name,
        employeeId: user.employeeId,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    return {
      success: false,
      message: "Something went wrong while creating your account.",
    };
  }
}

// ===============================
// LOGIN
// ===============================

export async function loginUser(formData) {
  try {
    const email = formData.get("email")?.trim().toLowerCase();
    const employeeId = formData.get("employeeId")?.trim();
    const password = formData.get("password");

    if (!email || !employeeId || !password) {
      return {
        success: false,
        message: "All fields are required.",
      };
    }

    await connectDB();

    // Find user using BOTH email and employee ID
    const user = await User.findOne({
      email,
      employeeId,
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid email or employee ID.",
      };
    }

    // Compare entered password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return {
        success: false,
        message: "Invalid password.",
      };
    }

    return {
      success: true,
      message: "Login successful.",

      user: {
        id: user._id.toString(),
        name: user.name,
        employeeId: user.employeeId,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return {
      success: false,
      message: "Something went wrong while logging in.",
    };
  }
}
