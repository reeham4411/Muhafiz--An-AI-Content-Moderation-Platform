import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log(`[db] connected -> ${env.MONGO_URI}`);
  } catch (err) {
    console.error("[db] connection failed", err);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("[db] disconnected");
});
