import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut, Menu } from "lucide-react";
import { Wordmark } from "@/components/ui-soleus/primitives";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuthState } from "@/lib/auth-state";
import { ADMIN_GROUPS, ADMIN_MODULES, adminPath } from "@/lib/admin/modules";
import { fmtDateLong } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

/** Mock count of open hour requests (shown as a small badge). */
const BADGES: Record<string, number> = { "stunden-anfragen": 1 };

function NavList({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Admin" className="space-y-7">
      {ADMIN_GROUPS.map((g) => (
        <div key={g}>
          <p className="eyebrow px-3 text-[0.625rem]">{g}</p>
          <ul className="mt-3 space-y-0.5">
            {ADMIN_MODULES.filter((m) => m.group === g).map((m) => {
              const href = adminPath(m.slug);
              const active = m.slug === "" ? path === "/admin" || path === "/admin/" : path === href || path.startsWith(href + "/");
              return (
                <li key={m.slug || "dashboard"}>
                  <Link
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    to={href as any}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-full px-4 py-2 text-[0.8125rem] transition-colors duration-300",
                      active ? "bg-primary font-medium text-primary-foreground" : "text-foreground/80 hover:bg-secondary",
                      m.planned && !active && "text-muted-foreground",
                    )}
                  >
                    <span>{m.label}</span>
                    {BADGES[m.slug] ? (
                      <span className={cn("flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.625rem] font-medium", active ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground")}>
                        {BADGES[m.slug]}
                      </span>
                    ) : m.planned ? (
                      <span className="text-[0.5625rem] uppercase tracking-[0.15em] opacity-70">Bald</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const { setRole } = useAuthState();
  return (
    <div className="flex h-full flex-col">
      <div className="px-7 pt-7 pb-8">
        <Link to="/admin" onClick={onNavigate} aria-label="SOLEUS Admin">
          <Wordmark />
        </Link>
        <p className="eyebrow mt-3 text-[0.625rem]">Admin-Bereich</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <NavList onNavigate={onNavigate} />
      </div>
      <div className="border-t border-border px-7 py-5">
        <p className="truncate text-xs text-muted-foreground">office@soleus.at</p>
        <div className="mt-4 flex flex-col items-start gap-3">
          <Link to="/home" className="eyebrow whitespace-nowrap transition-colors hover:text-foreground">Member-Ansicht</Link>
          <button
            type="button"
            onClick={() => setRole("customer")}
            className="eyebrow inline-flex items-center gap-2 whitespace-nowrap transition-colors hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} /> Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState("");
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => setToday(fmtDateLong(new Date())), []);

  const current = ADMIN_MODULES.find((m) => (m.slug === "" ? path === "/admin" || path === "/admin/" : path === adminPath(m.slug) || path.startsWith(adminPath(m.slug) + "/")));

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border bg-card lg:block">
        <SidebarBody />
      </aside>

      <div className="lg:pl-72">
        <header className="glass-light sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-x-0 border-t-0 border-b-border px-5 md:px-10">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button type="button" aria-label="Navigation öffnen" className="flex h-10 w-10 items-center justify-center rounded-full border border-border lg:hidden">
                  <Menu className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 border-0 bg-card p-0">
                <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
                <SidebarBody onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <p className="eyebrow text-foreground">{current?.label ?? "Admin"}</p>
          </div>
          <p className="eyebrow hidden sm:block" suppressHydrationWarning>{today}</p>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14">{children}</main>
      </div>
    </div>
  );
}
