import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017/epixx",
  jwtSecret: process.env.JWT_SECRET ?? "dev-only-change-me-min-32-chars-xxxx",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  isProd: process.env.NODE_ENV === "production",
};
