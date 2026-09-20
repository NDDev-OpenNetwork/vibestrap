import { ClientOnly, Link } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";

import { AccessDeniedError } from "#/shared/auth";
import { m } from "#/shared/lib/i18n/messages";

import { Button } from "./shadcn/button";
import { Skeleton } from "./shadcn/skeleton";

export const RoutePending = () => (
  <output className="space-y-4 p-6">
    <ClientOnly>
      <span className="sr-only">{m.app_page_loading()}</span>
    </ClientOnly>
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-48 w-full" />
  </output>
);

export const RouteNotFound = () => (
  <section className="grid min-h-80 place-content-center justify-items-center gap-4 p-6 text-center">
    <h1 className="text-2xl font-semibold">{m.app_page_not_found()}</h1>
    <Button nativeButton={false} render={<Link to="/" />}>
      {m.app_go_home()}
    </Button>
  </section>
);

export const RouteError = ({ error, reset }: ErrorComponentProps) => {
  const forbidden = error instanceof AccessDeniedError;
  return (
    <section className="grid min-h-80 place-content-center justify-items-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">
        {forbidden ? m.app_page_forbidden() : m.app_page_error()}
      </h1>
      <p role="alert">
        {forbidden ? m.app_page_forbidden_help() : m.app_page_error_help()}
      </p>
      {forbidden ? (
        <Button nativeButton={false} render={<Link to="/" />}>
          {m.app_go_home()}
        </Button>
      ) : (
        <Button onClick={reset}>{m.app_retry()}</Button>
      )}
    </section>
  );
};
