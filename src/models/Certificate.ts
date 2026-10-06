import { Schema, model } from "mongoose";

const certificateSchema = new Schema(
  {
    certificateId: { type: String, required: true, unique: true, index: true },
    studentName: { type: String, required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    issueDate: { type: Date, required: true },
    grade: String,
  },
  { timestamps: true },
);

export const Certificate = model("Certificate", certificateSchema);
