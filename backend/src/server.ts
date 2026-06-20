import { createApp } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { seedDefaultPolicies } from "./services/policyService";

async function bootstrap(): Promise<void> {
  await connectDB();
  await seedDefaultPolicies();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`[server] listening on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

bootstrap().catch((err) => {
  console.error("[bootstrap] failed to start server", err);
  process.exit(1);
});
