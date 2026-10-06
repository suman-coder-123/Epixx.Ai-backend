import { Schema, model } from "mongoose";

const testimonialSchema = new Schema(
  {
    studentName: { type: String, required: true },
    photo: String,
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    quote: { type: String, required: true },
    videoUrl: String,
    placedAt: String,
    featured: { type: Boolean, default: false, index: true },
    approved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const Testimonial = model("Testimonial", testimonialSchema);
