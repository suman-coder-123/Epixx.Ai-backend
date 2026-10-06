import { Schema, model } from "mongoose";

// Who changed what, and when — shown on the admin dashboard.
const activityLogSchema = new Schema(
  {
    action: { type: String, required: true }, // Created | Updated | Deleted | Status
    collection: { type: String, required: true, index: true },
    docId: { type: String, index: true },
    label: String,
    by: String,
  },
  { timestamps: { createdAt: true, updatedAt: false }, suppressReservedKeysWarning: true },
);

activityLogSchema.index({ createdAt: -1 });

export const ActivityLog = model("ActivityLog", activityLogSchema);
