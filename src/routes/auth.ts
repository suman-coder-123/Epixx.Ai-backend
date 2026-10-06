import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { AdminUser } from "../models/AdminUser.js";
import { asyncHandler, ok } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const admin = await AdminUser.findOne({ email: email.toLowerCase() });
  if (!admin || !admin.isActive) {
    res.status(401).json({ success: false, data: null, message: "Invalid credentials" });
    return;
  }
  const match = await bcrypt.compare(password, admin.passwordHash);
  if (!match) {
    res.status(401).json({ success: false, data: null, message: "Invalid credentials" });
    return;
  }
  admin.lastLogin = new Date();
  await admin.save();
  const token = jwt.sign({ sub: String(admin._id), role: admin.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
  res.cookie("token", token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 3600 * 1000,
    path: "/",
  });
  ok(res, { id: admin._id, name: admin.name, email: admin.email, role: admin.role }, "Logged in");
}));

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("token", { path: "/" });
  ok(res, null, "Logged out");
});

authRouter.get("/me", requireAuth, asyncHandler(async (req, res) => {
  ok(res, (req as { admin?: unknown }).admin, "Session");
}));
