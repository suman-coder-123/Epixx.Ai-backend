import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import { leadRouter } from "./routes/leads.js";
import { apiRouter } from "./routes/resources.js";
import { adminRouter } from "./routes/admin.js";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.frontendUrl.split(","), credentials: true }));
  app.use(morgan("dev"));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRouter);
  app.use("/api/leads", leadRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api", apiRouter);

  app.use(errorHandler);
  return app;
}
