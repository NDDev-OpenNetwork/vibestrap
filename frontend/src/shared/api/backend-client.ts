import { authClient } from "../auth/auth-client";
import { env } from "../config/env";
import { client } from "./generated/client.gen";
import { createClient } from "./generated/client/client.gen";
import { createConfig } from "./generated/client/utils.gen";

/** Create a client per SSR request and supply that request's access token. */
export const createBackendClient = (options: {
  baseUrl: string;
  getAccessToken: () => Promise<string | undefined>;
}) =>
  createClient(
    createConfig({
      baseUrl: options.baseUrl,
      auth: options.getAccessToken,
    })
  );

/** Browser client: resolve a fresh JWT from the cookie session for protected requests. */
export const backendClient = client;

backendClient.setConfig({
  baseUrl: env.VITE_API_URL,
  auth: async () => {
    if (typeof window === "undefined") {
      throw new TypeError(
        "Use createBackendClient with a request-scoped token during SSR."
      );
    }
    const { data, error } = await authClient.token();
    if (error) {
      throw new Error(error.message ?? "Could not obtain an API access token.");
    }
    return data?.token;
  },
});
