import { Link, useNavigate } from "@tanstack/react-router";
import { House, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

import { authClient } from "#/shared/auth";
import { env } from "#/shared/config";
import { m } from "#/shared/lib/i18n/messages";
import LocaleSwitcher from "#/shared/ui/locale-switcher";
import { Button } from "#/shared/ui/shadcn/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "#/shared/ui/shadcn/sheet";
import ThemeToggle from "#/shared/ui/theme-toggle";

const Navigation = ({ onNavigate }: { onNavigate?: () => void }) => (
  <nav aria-label={m.app_navigation()} className="p-3">
    <Link
      to="/"
      onClick={onNavigate}
      activeOptions={{ exact: true }}
      className="flex min-h-10 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
      activeProps={{
        className: "bg-accent font-medium text-accent-foreground",
        "aria-current": "page",
      }}
    >
      <House className="size-4" aria-hidden="true" />
      {m.home_page()}
    </Link>
  </nav>
);

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    setError(false);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error(result.error.message);
      await navigate({ to: "/login" });
    } catch {
      setError(true);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:p-3 focus:outline-2"
      >
        {m.app_skip_content()}
      </a>
      <aside className="hidden w-56 shrink-0 border-e bg-sidebar md:block">
        <div className="flex h-14 items-center border-b px-6 text-sm font-semibold">
          {env.VITE_APP_TITLE}
        </div>
        <Navigation />
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b px-4 py-2 sm:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label={m.app_open_menu()}
                  />
                }
              >
                <Menu aria-hidden="true" />
              </SheetTrigger>
              <SheetContent
                side="left"
                showCloseButton={false}
                className="w-64 gap-0 bg-sidebar"
              >
                <div className="flex min-h-14 items-center justify-between border-b px-4">
                  <SheetTitle>{env.VITE_APP_TITLE}</SheetTitle>
                  <SheetClose
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={m.app_close_menu()}
                      />
                    }
                  >
                    <X aria-hidden="true" />
                  </SheetClose>
                </div>
                <Navigation onNavigate={() => setMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="text-sm text-muted-foreground">
              {m.home_page()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <LocaleSwitcher />
            <ThemeToggle />
            <span className="mx-2 hidden max-w-40 truncate text-sm sm:block">
              {session?.user.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={m.auth_signout()}
              disabled={signingOut}
              onClick={() => {
                void signOut();
              }}
            >
              <LogOut aria-hidden="true" />
            </Button>
          </div>
        </header>
        {error && (
          <p role="alert" className="px-6 pt-4 text-sm text-destructive">
            {m.auth_network_error()}
          </p>
        )}
        <main id="main-content" tabIndex={-1} className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
