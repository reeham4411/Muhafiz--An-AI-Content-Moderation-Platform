/**
 * Usage:
 *   ts-node src/utils/createAdmin.ts admin@example.com SomePassword123 "Admin Name"
 *
 * Creates a new admin user, or promotes an existing user with that email to ADMIN.
 * Intended to be run manually (locally or via `docker-compose exec backend`).
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../models/User";
import { UserRole } from "../types";
import { env } from "../config/env";

async function main() {
  const [, , email, password, name] = process.argv;

  if (!email || !password) {
    console.error('Usage: ts-node src/utils/createAdmin.ts <email> <password> ["Name"]');
    process.exit(1);
  }

  await mongoose.connect(env.MONGO_URI);

  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    existing.role = UserRole.ADMIN;
    await existing.save();
    console.log(`[createAdmin] Existing user "${email}" promoted to ADMIN.`);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({
      name: name || "Admin",
      email: email.toLowerCase(),
      passwordHash,
      role: UserRole.ADMIN,
    });
    console.log(`[createAdmin] New admin user "${email}" created.`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("[createAdmin] failed:", err);
  process.exit(1);
});
