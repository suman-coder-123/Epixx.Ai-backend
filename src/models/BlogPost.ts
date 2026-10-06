import { Schema, model } from "mongoose";

const blogPostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    author: { type: String, required: true },
    coverImage: String,
    excerpt: { type: String, required: true },
    body: { type: String, required: true },
    category: { type: String, required: true, index: true },
    tags: [String],
    status: {
      type: String,
      enum: ["draft", "scheduled", "published"],
      default: "draft",
      index: true,
    },
    publishDate: Date,
    readTime: { type: Number, default: 5 },
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true },
);

blogPostSchema.index({ status: 1, publishDate: -1 });

export const BlogPost = model("BlogPost", blogPostSchema);
