import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import type { FormEvent } from "react";

import { authClient } from "#/shared/auth";
import { env } from "#/shared/config";
import { m } from "#/shared/lib/i18n/messages";
import LocaleSwitcher from "#/shared/ui/locale-switcher";
import { Button } from "#/shared/ui/shadcn/button";
import { Input } from "#/shared/ui/shadcn/input";
import ThemeToggle from "#/shared/ui/theme-toggle";

export const LoginPage = () => {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const destination = search.redirect ?? "/";
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = form.get("email");
    const password = form.get("password");
    const name = form.get("name");
    if (typeof email !== "string" || typeof password !== "string") return;
    setError("");
    setLoading(true);
    try {
      const result = isSignUp
        ? await authClient.signUp.email({
            email,
            password,
            name: typeof name === "string" ? name : "",
          })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(isSignUp ? m.auth_signup_error() : m.auth_signin_error());
        return;
      }
      await navigate({ href: destination });
    } catch {
      setError(m.auth_network_error());
    } finally {
      setLoading(false);
    }
  };
  const signOut = async () => {
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) setError(m.auth_network_error());
    } catch {
      setError(m.auth_network_error());
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <span className="text-sm font-semibold">{env.VITE_APP_TITLE}</span>
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {isPending ? (
            <output>{m.auth_loading()}</output>
          ) : session?.user ? (
            <section className="space-y-6">
              <h1 className="text-2xl font-semibold tracking-tight">
                {m.auth_welcome()}
              </h1>
              <p>{m.auth_signed_in({ email: session.user.email })}</p>
              <Button nativeButton={false} render={<Link to={destination} />}>
                {m.auth_continue()}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void signOut();
                }}
              >
                {m.auth_signout()}
              </Button>
            </section>
          ) : (
            <section>
              <h1 className="mb-2 text-2xl font-semibold tracking-tight">
                {isSignUp ? m.auth_signup() : m.auth_signin()}
              </h1>
              <p className="mb-6 text-sm text-muted-foreground">
                {isSignUp
                  ? m.auth_signup_description()
                  : m.auth_signin_description()}
              </p>
              <form
                onSubmit={(event) => {
                  void handleSubmit(event);
                }}
                className="space-y-4"
              >
                {isSignUp && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="name">
                      {m.auth_name()}
                    </label>
                    <Input id="name" name="name" autoComplete="name" required />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    {m.auth_email()}
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="password">
                    {m.auth_password()}
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={
                      isSignUp ? "new-password" : "current-password"
                    }
                    required
                    minLength={isSignUp ? 8 : undefined}
                    maxLength={128}
                    aria-describedby={isSignUp ? "password-help" : undefined}
                  />
                  {isSignUp && (
                    <p
                      id="password-help"
                      className="text-sm text-muted-foreground"
                    >
                      {m.auth_password_help()}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading
                    ? m.auth_loading()
                    : isSignUp
                      ? m.auth_signup()
                      : m.auth_signin()}
                </Button>
              </form>
              <Button
                type="button"
                variant="ghost"
                className="mt-4 h-auto min-h-9 w-full whitespace-normal"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
              >
                {isSignUp ? m.auth_switch_signin() : m.auth_switch_signup()}
              </Button>
            </section>
          )}
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        </div>
      </main>
    </div>
  );
};
