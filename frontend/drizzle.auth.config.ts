import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  out: "./drizzle/auth",
  schema: "./src/app/server/auth-schema.ts",
  dialect: "postgresql",
  schemaFilter: ["auth"],
  migrations: { schema: "auth", table: "__drizzle_migrations" },
  dbCredentials: {
    url:
      process.env.AUTH_DATABASE_URL ??
      "postgresql://vibestrap:vibestrap@localhost:5432/vibestrap",
  },
});
