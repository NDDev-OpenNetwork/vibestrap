import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { account, jwks, session, user, verification } from "./auth-schema";

export const authPool = new Pool({
  connectionString:
    process.env.AUTH_DATABASE_URL ??
    "postgresql://vibestrap:vibestrap@localhost:5432/vibestrap",
  max: 5,
});

export const authDb = drizzle(authPool, {
  schema: { account, jwks, session, user, verification },
});
