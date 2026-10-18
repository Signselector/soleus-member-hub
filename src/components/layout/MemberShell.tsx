import { Link } from "@tanstack/react-router";
import { CalendarPlus, Home, ListChecks, CreditCard, User } from "lucide-react";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/ui-soleus/primitives";
import { useAuthState } from "@/lib/auth-state";

const nav = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/buchen", label: "Buchen", icon: CalendarPlus },
  { to: "/buchungen", label: "Buchungen", icon: ListChecks },
  { to: "/mitgliedschaft", label: "Mitgliedschaft", icon: CreditCard },
  { to: "/profil", label: "Profil", icon: User },
] as const;

export function MemberShell({ children }: { children: ReactNode }) {
  const { role } = useAuthState();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass-light border-x-0 border-t-0 border-b-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:h-20 md:px-10">
          <Link to="/home" aria-label="SOLEUS Home">
            <Wordmark />
          </Link>
          <nav className="hidden items-center gap-10 md:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-300 hover:text-foreground"
                activeProps={{ className: "!text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
            {role === "admin" && (
              <Link to="/admin" className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-foreground underline underline-offset-8">
                Admin
              </Link>
            )}
          </nav>
          <Link
            to="/profil"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-[0.6875rem] tracking-[0.1em] md:hidden"
            aria-label="Profil"
          >
            MM
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-10 pb-32 md:px-10 md:pt-20 md:pb-24">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 glass-light border-x-0 border-b-0 border-t-border pb-safe md:hidden">
        <div className="grid grid-cols-5">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex min-h-16 flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors"
              activeProps={{ className: "!text-foreground" }}
            >
              <n.icon className="h-5 w-5" strokeWidth={1.25} />
              <span className="text-[0.5625rem] uppercase tracking-[0.12em]">
                {n.label === "Mitgliedschaft" ? "Abo" : n.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
