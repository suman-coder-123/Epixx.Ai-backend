import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AdminUser } from "../models/AdminUser.js";

export interface AuthRequest extends Request {
  admin?: { id: string; role: string; email: string };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token as string | undefined;
  if (!token) {
    res.status(401).json({ success: false, data: null, message: "Unauthorized", error: "No token" });
    return;
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    const admin = await AdminUser.findById(payload.sub).select("_id email role isActive").lean();
    if (!admin || !admin.isActive) {
      res.status(401).json({ success: false, data: null, message: "Unauthorized", error: "Inactive" });
      return;
    }
    req.admin = { id: String(admin._id), role: admin.role, email: admin.email };
    next();
  } catch {
    res.status(401).json({ success: false, data: null, message: "Unauthorized", error: "Bad token" });
  }
}

export const requireRole =
  (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      res.status(403).json({ success: false, data: null, message: "Forbidden", error: "Insufficient role" });
      return;
    }
    next();
  };
