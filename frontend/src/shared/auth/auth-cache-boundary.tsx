import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { authClient } from "./auth-client";

/** Prevent private cached data from surviving logout or a switch to another session. */
export const AuthCacheBoundary = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  const { data, isPending } = authClient.useSession();
  const queryClient = useQueryClient();
  const previous = useRef<{ sessionId: string | null } | null>(null);
  const identity = data?.session.id ?? null;

  useEffect(() => {
    if (isPending) {
      return;
    }
    if (previous.current !== null && previous.current.sessionId !== identity) {
      queryClient.clear();
    }
    previous.current = { sessionId: identity };
  }, [identity, isPending, queryClient]);

  return children;
};
