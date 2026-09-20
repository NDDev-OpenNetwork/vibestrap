/**
 * Print a short-lived API token for a local account, for curl and manual checks.
 *
 *   bun run token                       user@vibestrap.local
 *   bun run token admin@vibestrap.local
 *
 * Runs against the database directly, so the dev server does not have to be up.
 */
import { auth } from "../src/app/server/auth.server";

const email = process.argv[2] ?? "user@vibestrap.local";
const password = process.env.SEED_PASSWORD ?? "vibestrap-dev";

const signIn = await auth.api.signInEmail({
  body: { email, password },
  asResponse: true,
});
const setCookie = signIn.headers.getSetCookie();
if (setCookie.length === 0) {
  throw new Error(`Could not sign in as ${email}. Run \`bun run seed\` first.`);
}
const cookie = setCookie.map((value) => value.split(";")[0]).join("; ");

const { token } = await auth.api.getToken({ headers: new Headers({ cookie }) });
process.stdout.write(`${token}\n`);
process.exit(0);
