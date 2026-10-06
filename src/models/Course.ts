import { Schema, model } from "mongoose";

const faqSchema = new Schema({ q: String, a: String }, { _id: false });
const syllabusSchema = new Schema(
  { module: String, topics: [String] },
  { _id: false },
);

const courseSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    syllabus: { type: [syllabusSchema], default: [] },
    duration: { type: String, required: true },
    fees: { type: Number, default: 0 },
    discountedFees: Number,
    mode: { type: String, enum: ["Online", "Offline", "Hybrid"], required: true, index: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
    thumbnail: String,
    trainer: { type: Schema.Types.ObjectId, ref: "Trainer" },
    highlights: [String],
    faqs: [faqSchema],
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    order: { type: Number, default: 0 },
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true },
);

courseSchema.index({ status: 1, category: 1, createdAt: -1 });

export const Course = model("Course", courseSchema);
