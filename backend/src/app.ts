import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import apiRoutes from "./routes";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";
import { env } from "./config/env";

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  // Serve uploaded images statically (useful for admin review / QA in Postman)
  app.use("/uploads", express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "AI Content Moderation backend is running" });
  });

  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
