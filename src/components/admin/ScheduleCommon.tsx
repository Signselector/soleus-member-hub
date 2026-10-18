import { useEffect, useState, type ReactNode } from "react";
import { BookOpen, CalendarDays, Settings } from "lucide-react";
import { BookingDialog } from "@/components/admin/BookingDialog";
import { BookingChip } from "@/components/admin/ui";
import { dayKey, fmtDayShort, fmtRange, fullName, parseLocal } from "@/lib/admin/format";
import { TYPE_LABEL, type AdminBooking } from "@/lib/admin/mock";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export type ScheduleTab = "calendar" | "bookings" | "settings";
const TABS: { key: ScheduleTab; label: string; icon: typeof CalendarDays }[] = [
  { key: "calendar", label: "Kalenderansicht", icon: CalendarDays },
  { key: "bookings", label: "Buchungen", icon: BookOpen },
  { key: "settings", label: "Einstellungen", icon: Settings },
];

export function ScheduleTabs({ tab, setTab }: { tab: ScheduleTab; setTab: (t: ScheduleTab) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          role="tab"
          aria-selected={tab === key}
          onClick={() => setTab(key)}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] transition-colors",
            tab === key ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary",
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} /> {label}
        </button>
      ))}
    </div>
  );
}

/** Upcoming bookings as a list; used by the "Buchungen" tab of both schedules. */
export function ScheduleBookings({ extra }: { extra?: ReactNode }) {
  const { bookings, customers, trainers } = useAdminStore();
  const [now, setNow] = useState<Date | null>(null);
  const [open, setOpen] = useState<AdminBooking | null>(null);
  useEffect(() => setNow(new Date()), []);
  if (!now) return null;
  const today = dayKey(now);
  const rows = bookings.filter((b) => b.status !== "cancelled" && b.start.slice(0, 10) >= today).sort((a, b) => a.start.localeCompare(b.start));
  const name = (id: string) => {
    const c = customers.find((x) => x.id === id);
    return c ? fullName(c) : "Unbekannt";
  };
  return (
    <div className="space-y-6">
      {extra}
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Keine kommenden Buchungen.</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {rows.map((b) => (
            <li key={b.id} className="grid gap-2 py-4 md:grid-cols-[8rem_9rem_1.4fr_1.2fr_1fr_auto] md:items-center">
              <p className="text-sm tabular-nums">{fmtDayShort(b.start)}</p>
              <p className="text-sm tabular-nums text-muted-foreground">{fmtRange(b.start, b.durationMin)}</p>
              <p className="text-sm font-medium">{name(b.customerId)}</p>
              <p className="text-sm text-muted-foreground">{TYPE_LABEL[b.type]}</p>
              <p className="text-sm text-muted-foreground">{trainers.find((t) => t.id === b.trainerId)?.name ?? "Ohne Trainer"}</p>
              <div className="flex items-center gap-4 md:justify-end">
                <BookingChip status={b.status} />
                <button type="button" onClick={() => setOpen(b)} className="eyebrow hover:text-foreground">Öffnen</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {open && <BookingDialog booking={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

export const startHour = (b: AdminBooking) => parseLocal(b.start).getHours();
