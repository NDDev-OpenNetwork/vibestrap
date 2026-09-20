import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { House, LogOut, Menu, NotebookPen, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

type NavigationItem = {
  to: "/" | "/notes";
  icon: LucideIcon;
  label: () => string;
  exact?: boolean;
};

/** Add a page here and it appears in the sidebar, the mobile menu and the header title. */
const navigation: NavigationItem[] = [
  { to: "/", icon: House, label: () => m.home_page(), exact: true },
  { to: "/notes", icon: NotebookPen, label: () => m.notes_page() },
];

const linkClassName =
  "flex min-h-10 items-center gap-2 rounded-md px-3 text-muted-foreground text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2";
const activeProps = {
  className: "bg-accent font-medium text-accent-foreground",
  "aria-current": "page",
} as const;

const Navigation = ({ onNavigate }: { onNavigate?: () => void }) => (
  <nav aria-label={m.app_navigation()} className="grid gap-1 p-3">
    {navigation.map(({ to, icon: Icon, label, exact }) => (
      <Link
        key={to}
        to={to}
        onClick={onNavigate}
        activeOptions={exact ? { exact: true } : undefined}
        className={linkClassName}
        activeProps={activeProps}
      >
        <Icon className="size-4" aria-hidden="true" />
        {label()}
      </Link>
    ))}
  </nav>
);

const useCurrentPageLabel = () => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const match = navigation
    .filter(
      (item) =>
        pathname === item.to || (!item.exact && pathname.startsWith(item.to))
    )
    .at(-1);
  return match?.label() ?? m.home_page();
};

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { data: session } = authClient.useSession();
  const pageLabel = useCurrentPageLabel();
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
            <span className="text-sm text-muted-foreground">{pageLabel}</span>
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
