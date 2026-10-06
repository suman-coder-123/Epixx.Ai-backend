import { Schema, model } from "mongoose";

const adminUserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["SuperAdmin", "ContentManager", "Counselor"],
      default: "Counselor",
    },
    lastLogin: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const AdminUser = model("AdminUser", adminUserSchema);
