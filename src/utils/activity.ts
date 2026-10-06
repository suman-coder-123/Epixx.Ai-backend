import type { Request } from "express";
import { ActivityLog } from "../models/ActivityLog.js";

// Fire-and-forget audit trail for admin writes. Never blocks the response.
export function logActivity(
  req: Request,
  action: string,
  collection: string,
  doc: { _id?: unknown; title?: unknown; name?: unknown } | null,
  label?: string,
) {
  const admin = (req as { admin?: { email: string } }).admin;
  const resolved =
    label ??
    (typeof doc?.title === "string"
      ? doc.title
      : typeof doc?.name === "string"
        ? doc.name
        : undefined);
  ActivityLog.create({
    action,
    collection,
    docId: doc?._id ? String(doc._id) : undefined,
    label: resolved,
    by: admin?.email ?? "system",
  }).catch((err) => console.error("activity log failed", err));
}
