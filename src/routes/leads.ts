import { Router } from "express";
import rateLimit from "express-rate-limit";
import { leadSchema } from "../shared/index.js";
import { Lead } from "../models/Lead.js";
import { asyncHandler, ok } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { logActivity } from "../utils/activity.js";

export const leadRouter = Router();

// Spam protection on public capture endpoint.
const leadLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 30 });

// Public: capture from any enquiry/demo/contact form.
leadRouter.post("/", leadLimiter, validate(leadSchema), asyncHandler(async (req, res) => {
  // Empty-string ObjectId refs ("") fail Mongoose casting — drop them.
  const payload = { ...req.body } as Record<string, unknown>;
  for (const k of ["courseInterested", "assignedTo"]) {
    if (payload[k] === "") delete payload[k];
  }
  const doc = await Lead.create(payload);
  // TODO: trigger WhatsApp/email alert to counselors here (webhook).
  ok(res, { id: doc._id }, "Thanks! Our counselor will call you shortly.", 201);
}));

// Admin: inbox with filters.
leadRouter.get(
  "/",
  requireAuth,
  requireRole("SuperAdmin", "Counselor", "ContentManager"),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const filter: Record<string, unknown> = {};
    for (const k of ["status", "type", "sourcePage"]) {
      if (typeof req.query[k] === "string") filter[k] = req.query[k];
    }
    const [items, total] = await Promise.all([
      Lead.find(filter).sort("-createdAt").skip((page - 1) * limit).limit(limit).lean(),
      Lead.countDocuments(filter),
    ]);
    ok(res, { items, total, page, pages: Math.ceil(total / limit) }, "Leads fetched");
  }),
);

leadRouter.patch(
  "/:id",
  requireAuth,
  requireRole("SuperAdmin", "Counselor"),
  asyncHandler(async (req, res) => {
    const allowed = ["status", "assignedTo"];
    const patch: Record<string, unknown> = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    if (typeof req.body.note === "string" && req.body.note.trim()) {
      patch.$push = { notes: { text: req.body.note, by: (req as { admin?: { email: string } }).admin?.email } };
    }
    const doc = await Lead.findByIdAndUpdate(req.params.id, patch, { new: true });
    if (!doc) { res.status(404).json({ success: false, data: null, message: "Not found" }); return; }
    logActivity(req, "Status", "Lead", { _id: doc._id, name: `${doc.name} → ${doc.status}` });
    ok(res, doc, "Lead updated");
  }),
);
