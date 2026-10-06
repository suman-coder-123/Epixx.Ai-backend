import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
}
