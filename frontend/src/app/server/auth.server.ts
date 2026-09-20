import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, jwt } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { config } from "dotenv";

import { adminAccessControl, adminRoles } from "#/shared/auth/index.server";

import { authDb } from "./auth-db.server";
import { guardAdminChanges } from "./auth-guards.server";

config({ path: [".env.local", ".env"], quiet: true });

const authBaseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  baseURL: authBaseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(authDb, { provider: "pg" }),
  hooks: { before: guardAdminChanges },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      ac: adminAccessControl,
      roles: adminRoles,
    }),
    jwt({
      jwks: {
        keyPairConfig: { alg: "EdDSA", crv: "Ed25519" },
      },
      jwt: {
        issuer: authBaseURL,
        audience: process.env.BETTER_AUTH_JWT_AUDIENCE ?? "vibestrap-api",
        expirationTime: "5m",
        definePayload: ({ session }) => ({ sid: session.id }),
      },
    }),
    tanstackStartCookies(),
  ],
});
