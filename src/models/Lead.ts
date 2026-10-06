import { Schema, model } from "mongoose";

const noteSchema = new Schema(
  { text: String, by: String, at: { type: Date, default: Date.now } },
  { _id: false },
);

const leadSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    email: String,
    courseInterested: { type: Schema.Types.ObjectId, ref: "Course" },
    courseLabel: String,
    message: String,
    sourcePage: { type: String, default: "/" },
    type: {
      type: String,
      enum: ["enquiry", "demo", "corporate", "contact"],
      default: "enquiry",
      index: true,
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Demo Scheduled", "Enrolled", "Not Interested"],
      default: "New",
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    notes: [noteSchema],
  },
  { timestamps: true },
);

leadSchema.index({ status: 1, createdAt: -1 });

export const Lead = model("Lead", leadSchema);
