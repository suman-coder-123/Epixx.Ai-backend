import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AdminUser } from "../models/AdminUser.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { Lead } from "../models/Lead.js";
import { Batch } from "../models/Batch.js";
import { Course } from "../models/Course.js";
import { Testimonial } from "../models/Testimonial.js";
import { asyncHandler, ok } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { logActivity } from "../utils/activity.js";

export const adminRouter = Router();
adminRouter.use(requireAuth);

const staff = requireRole("SuperAdmin", "Counselor", "ContentManager");
const superOnly = requireRole("SuperAdmin");

// GET /api/admin/stats — dashboard numbers, charts, recent leads.
adminRouter.get("/stats", staff, asyncHandler(async (_req, res) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayAgo14 = new Date(now.getTime() - 14 * 86400000);

  const [
    leadsWeek,
    leadsMonth,
    enrolled,
    demoScheduled,
    activeBatches,
    publishedCourses,
    pendingTestimonials,
    leadsByStatus,
    topCourses,
    byDay,
    recentLeads,
    recentActivity,
  ] = await Promise.all([
    Lead.countDocuments({ createdAt: { $gte: weekAgo } }),
    Lead.countDocuments({ createdAt: { $gte: monthStart } }),
    Lead.countDocuments({ status: "Enrolled" }),
    Lead.countDocuments({ status: "Demo Scheduled" }),
    Batch.countDocuments({ status: { $in: ["upcoming", "filling-fast"] } }),
    Course.countDocuments({ status: "published" }),
    Testimonial.countDocuments({ approved: false }),
    Lead.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Lead.aggregate([
      { $match: { courseLabel: { $nin: [null, ""] } } },
      { $group: { _id: "$courseLabel", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Lead.aggregate([
      { $match: { createdAt: { $gte: dayAgo14 } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Lead.find().sort("-createdAt").limit(8).lean(),
    ActivityLog.find().sort("-createdAt").limit(10).lean(),
  ]);

  ok(res, {
    leadsWeek,
    leadsMonth,
    enrolled,
    demoScheduled,
    activeBatches,
    publishedCourses,
    pendingTestimonials,
    leadsByStatus,
    topCourses,
    byDay,
    recentLeads,
    recentActivity,
  }, "Stats fetched");
}));

// GET /api/admin/activity — audit trail.
adminRouter.get(
  "/activity",
  requireRole("SuperAdmin", "ContentManager"),
  asyncHandler(async (req, res) => {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 30)));
    const items = await ActivityLog.find().sort("-createdAt").limit(limit).lean();
    ok(res, { items }, "Activity fetched");
  }),
);

// Team management — SuperAdmin only.
const createUserSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["SuperAdmin", "ContentManager", "Counselor"]),
});

adminRouter.get("/users", superOnly, asyncHandler(async (_req, res) => {
  const items = await AdminUser.find().select("-passwordHash").sort("name").lean();
  ok(res, { items }, "Users fetched");
}));

adminRouter.post("/users", superOnly, validate(createUserSchema), asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body as z.infer<typeof createUserSchema>;
  const exists = await AdminUser.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(409).json({ success: false, data: null, message: "Email already exists" });
    return;
  }
  const doc = await AdminUser.create({
    name,
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    role,
    isActive: true,
  });
  logActivity(req, "Created", "AdminUser", { _id: doc._id, name });
  ok(res, { id: doc._id, name, email, role }, "User created", 201);
}));

adminRouter.patch("/users/:id", superOnly, asyncHandler(async (req, res) => {
  const patch: Record<string, unknown> = {};
  if (req.body.role) patch.role = req.body.role;
  if (typeof req.body.isActive === "boolean") patch.isActive = req.body.isActive;
  const doc = await AdminUser.findByIdAndUpdate(req.params.id, patch, { new: true }).select("-passwordHash");
  if (!doc) { res.status(404).json({ success: false, data: null, message: "Not found" }); return; }
  logActivity(req, "Updated", "AdminUser", { _id: doc._id, name: doc.name });
  ok(res, doc, "User updated");
}));

adminRouter.delete("/users/:id", superOnly, asyncHandler(async (req, res) => {
  const doc = await AdminUser.findByIdAndDelete(req.params.id).select("-passwordHash");
  if (!doc) { res.status(404).json({ success: false, data: null, message: "Not found" }); return; }
  logActivity(req, "Deleted", "AdminUser", { _id: req.params.id, name: doc.name });
  ok(res, null, "User deleted");
}));
