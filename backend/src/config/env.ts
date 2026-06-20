import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: required("MONGO_URI", "mongodb://mongo:27017/content_moderation"),
  JWT_SECRET: required("JWT_SECRET", "dev_secret_change_me"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  MAX_UPLOAD_MB: parseInt(process.env.MAX_UPLOAD_MB || "8", 10),
  // Defaults to "uploads" (relative to process.cwd()). In dev (ts-node run from
  // project root) this resolves to <root>/uploads. In the Docker image, WORKDIR
  // is /app and compiled output runs from /app, so this resolves to /app/uploads.
  // Override via .env if you want a different path.
  UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",
  ADMIN_SEED_EMAIL: process.env.ADMIN_SEED_EMAIL || "",
  ADMIN_SEED_PASSWORD: process.env.ADMIN_SEED_PASSWORD || "",
};
