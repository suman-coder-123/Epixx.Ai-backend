import { Schema, model } from "mongoose";

const trainerSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    photo: String,
    bio: { type: String, required: true },
    expertise: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    linkedIn: String,
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true },
);

export const Trainer = model("Trainer", trainerSchema);
