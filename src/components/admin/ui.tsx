import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, type AccountStatus, type BookingStatus, type MandateStatus } from "@/lib/admin/mock";

/** Page title block: eyebrow, large light headline, optional intro and actions. */
export function PageHeader({ eyebrow, title, intro, actions }: { eyebrow?: string; title: string; intro?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">{title}</h1>
        {intro && <p className="mt-3 max-w-xl text-base font-light text-muted-foreground">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

/** Quiet status chip: neutral and brown tones only, no traffic-light colours. */
const tone = {
  strong: "bg-primary text-primary-foreground",
  soft: "bg-secondary text-secondary-foreground",
  line: "border border-foreground/25 text-foreground",
  muted: "bg-muted text-muted-foreground",
  alert: "border border-destructive/50 text-destructive",
} as const;

export function Chip({ children, t = "soft", className }: { children: ReactNode; t?: keyof typeof tone; className?: string }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-[0.625rem] font-medium uppercase tracking-[0.15em]", tone[t], className)}>
      {children}
    </span>
  );
}

const bookingTone: Record<BookingStatus, keyof typeof tone> = {
  booked: "soft",
  active: "strong",
  completed: "muted",
  cancelled: "line",
  no_show: "alert",
  overrun: "alert",
};
export const BookingChip = ({ status }: { status: BookingStatus }) => <Chip t={bookingTone[status]}>{STATUS_LABEL[status]}</Chip>;

const accountLabel: Record<AccountStatus, string> = { active: "Aktiv", paused: "Pausiert", cancelled: "Gekündigt", pending: "Offen" };
const accountTone: Record<AccountStatus, keyof typeof tone> = { active: "strong", paused: "soft", cancelled: "line", pending: "muted" };
export const AccountChip = ({ status }: { status: AccountStatus }) => <Chip t={accountTone[status]}>{accountLabel[status]}</Chip>;

const mandateLabel: Record<MandateStatus, string> = { active: "Mandat aktiv", pending: "Mandat offen", failed: "Fehlgeschlagen", none: "Kein Mandat" };
const mandateTone: Record<MandateStatus, keyof typeof tone> = { active: "soft", pending: "muted", failed: "alert", none: "line" };
export const MandateChip = ({ status }: { status: MandateStatus }) => <Chip t={mandateTone[status]}>{mandateLabel[status]}</Chip>;

/** Hairline-separated section with an eyebrow title. */
export function Section({ title, aside, children, className }: { title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("border-t border-border pt-6", className)}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="eyebrow text-foreground">{title}</h2>
        {aside}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export const inputCls =
  "h-11 w-full rounded-full border border-border bg-card px-5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-foreground focus:outline-none";
export const selectCls = inputCls + " appearance-none pr-10";
