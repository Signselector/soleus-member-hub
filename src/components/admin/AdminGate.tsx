import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/ui-soleus/primitives";
import { useAuthState } from "@/lib/auth-state";

/**
 * UI-level guard for /admin. NOTE: this is only the interface layer. Real authorization (role check on every
 * admin API call, row-level security) must be enforced by the backend once it exists.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const { role, ready, user } = useAuthState();
  if (!ready) return <div className="min-h-screen bg-background" aria-busy />;
  if (role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <Wordmark />
        <p className="eyebrow mt-16">403</p>
        <h1 className="mt-4 text-4xl font-light tracking-tight md:text-5xl">Kein Zugriff.</h1>
        <p className="mt-4 max-w-sm text-base font-light text-muted-foreground">Dieser Bereich ist nur für Administratoren des SOLEUS Teams.</p>
        <Link
          to={user === "guest" ? "/login" : "/home"}
          className="mt-10 inline-flex min-h-12 items-center rounded-full bg-[#211d1b] px-8 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]"
        >
          {user === "guest" ? "Zum Login" : "Zur Member Area"}
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}
