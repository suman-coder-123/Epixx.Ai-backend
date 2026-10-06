import { Schema, model } from "mongoose";

const batchSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    startDate: { type: Date, required: true, index: true },
    endDate: Date,
    mode: { type: String, enum: ["Online", "Offline", "Hybrid"], required: true },
    timing: { type: String, required: true },
    trainer: { type: Schema.Types.ObjectId, ref: "Trainer" },
    totalSeats: { type: Number, default: 30 },
    seatsFilled: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["upcoming", "filling-fast", "full", "completed"],
      default: "upcoming",
      index: true,
    },
  },
  { timestamps: true },
);

export const Batch = model("Batch", batchSchema);
