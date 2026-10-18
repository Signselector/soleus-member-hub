import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useAuthState, type UserState } from "@/lib/auth-state";
import { cn } from "@/lib/utils";

function Opt({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "min-h-9 flex-1 px-2 text-[0.625rem] uppercase tracking-[0.15em] transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}

export function MockStateSwitcher() {
  const [open, setOpen] = useState(false);
  const s = useAuthState();
  const navigate = useNavigate();
  const goUser = (u: UserState) => {
    s.setUser(u);
    navigate({ to: u === "guest" ? "/login" : u === "new" ? "/willkommen" : "/home" });
  };

  return (
    <div className="fixed right-4 bottom-24 z-50 md:bottom-6">
      {open ? (
        <div className="w-72 border border-border bg-card p-4 shadow-lg animate-rise">
          <div className="mb-3 flex items-center justify-between">
            <span className="eyebrow">Mock State</span>
            <button aria-label="Schließen" onClick={() => setOpen(false)} className="p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="eyebrow mb-1.5">User</p>
          <div className="flex border border-border">
            <Opt active={s.user === "guest"} onClick={() => goUser("guest")}>Gast</Opt>
            <Opt active={s.user === "new"} onClick={() => goUser("new")}>Neu</Opt>
            <Opt active={s.user === "member"} onClick={() => goUser("member")}>Member</Opt>
          </div>
          <p className="eyebrow mt-4 mb-1.5">Buchung</p>
          <div className="flex border border-border">
            <Opt active={s.booking === "upcoming"} onClick={() => s.setBooking("upcoming")}>Fall A · Session</Opt>
            <Opt active={s.booking === "none"} onClick={() => s.setBooking("none")}>Fall B · Keine</Opt>
          </div>
          <p className="eyebrow mt-4 mb-1.5">Zutritt</p>
          <div className="flex border border-border">
            <Opt active={s.access === "pending"} onClick={() => s.setAccess("pending")}>Ab 17:30</Opt>
            <Opt active={s.access === "active"} onClick={() => s.setAccess("active")}>Aktiv</Opt>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Mock State öffnen"
          className="flex h-11 w-11 items-center justify-center border border-border bg-card text-foreground shadow-md transition-colors hover:bg-secondary"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
