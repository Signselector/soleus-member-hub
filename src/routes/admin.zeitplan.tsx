import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { BookingDialog } from "@/components/admin/BookingDialog";
import { ScheduleBookings, ScheduleTabs, startHour, type ScheduleTab } from "@/components/admin/ScheduleCommon";
import { LegendItem, MiniChip, SlotCell, Swatch, WeekCalendar, hhmm } from "@/components/admin/WeekCalendar";
import { PageHeader, Section, inputCls } from "@/components/admin/ui";
import { Switch } from "@/components/ui/switch";
import { dayKey, fmtDate, fullName } from "@/lib/admin/format";
import { WEEKDAYS_LONG } from "@/lib/admin/mock2";
import type { AdminBooking } from "@/lib/admin/mock";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/zeitplan")({
  head: () => ({ meta: [{ title: "Zeitplan — SOLEUS Admin" }] }),
  component: Schedule,
});

const ICON = { private_gym: "◇", premium: "◆", standard: "○" } as const;
const NAME = { private_gym: "Private Gym", premium: "Premium", standard: "Standard" } as const;

function Schedule() {
  const [tab, setTab] = useState<ScheduleTab>("calendar");
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Planung" title="Zeitplan verwalten" intro="Lege deine wöchentliche Verfügbarkeit fest und sperre bestimmte Tage." />
      <ScheduleTabs tab={tab} setTab={setTab} />
      {tab === "calendar" && <CalendarTab />}
      {tab === "bookings" && <ScheduleBookings />}
      {tab === "settings" && <SettingsTab />}
    </div>
  );
}

function CalendarTab() {
  const { bookings, customers, availability, blocked, deleteBookings } = useAdminStore();
  const [trainerId, setTrainerId] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [sel, setSel] = useState<string[]>([]);
  const [open, setOpen] = useState<{ booking: AdminBooking | null; preset?: { date: string; time: string } } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const name = (id: string) => {
    const c = customers.find((x) => x.id === id);
    return c ? fullName(c) : "Unbekannt";
  };

  const cell = (d: Date, h: number) => {
    const k = dayKey(d);
    const a = availability[(d.getDay() + 6) % 7];
    const range = `${hhmm(h)} - ${hhmm(h + 1)}`;
    const block = blocked.find((b) => b.date === k);
    if (!a?.enabled || h < Number(a.from.slice(0, 2)) || h >= Number(a.to.slice(0, 2))) return <SlotCell tone="off" title="" />;
    if (block) return <SlotCell tone="locked" title={range} sub="Gesperrt" />;
    const b = bookings.find((x) => x.status !== "cancelled" && dayKey(d) === x.start.slice(0, 10) && startHour(x) === h && (!trainerId || x.trainerId === trainerId));
    if (b) {
      return (
        <SlotCell
          tone="booked"
          title={`${ICON[b.type]} ${range}`}
          sub={`${NAME[b.type]} ${b.session[0]}/${b.session[1]}`}
          chips={<><span className="text-[0.625rem]">{name(b.customerId)}</span><MiniChip dark>{b.type === "private_gym" ? "PG" : b.type === "premium" ? "PT" : "ST"}</MiniChip><MiniChip dark>{b.trainerId ? "+C" : "-C"}</MiniChip></>}
          selected={sel.includes(b.id)}
          onClick={() => (selectMode ? setSel((p) => (p.includes(b.id) ? p.filter((x) => x !== b.id) : [...p, b.id])) : setOpen({ booking: b }))}
        />
      );
    }
    return <SlotCell tone="free" title={`${ICON.private_gym} ${range}`} sub="Private Gym 0/1" onClick={selectMode ? undefined : () => setOpen({ booking: null, preset: { date: k, time: hhmm(h) } })} />;
  };

  return (
    <>
      <WeekCalendar
        renderCell={cell}
        trainerId={trainerId}
        setTrainerId={setTrainerId}
        selectMode={selectMode}
        setSelectMode={(v) => { setSelectMode(v); if (!v) setSel([]); }}
        selectedCount={sel.length}
        onDeleteSelected={() => setConfirm(true)}
        legend={
          <>
            <LegendItem swatch={<Swatch cls="border-border bg-secondary/50" />}>Frei (Private Gym)</LegendItem>
            <LegendItem swatch={<Swatch cls="border-[#211d1b] bg-[#211d1b]" />}>Gebucht</LegendItem>
            <LegendItem swatch={<Swatch cls="border-border bg-muted" />}>Gesperrt</LegendItem>
            <span>◇ Private Gym · ◆ Premium · ○ Standard</span>
            <span><MiniChip>PT</MiniChip> Personal Training</span>
            <span><MiniChip>+C</MiniChip> Mit Personal Coach</span>
            <span><MiniChip>-C</MiniChip> Ohne Personal Coach</span>
          </>
        }
      />
      {open && <BookingDialog booking={open.booking} {...(open.preset ? { preset: open.preset } : {})} onClose={() => setOpen(null)} />}
      {confirm && (
        <div role="dialog" aria-label="Löschen bestätigen" className="fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-md items-center justify-between gap-4 rounded-2xl bg-[#211d1b] p-5 text-sm text-[#f7f5f1] shadow-xl">
          <span>{sel.length} Buchung(en) endgültig löschen?</span>
          <span className="flex gap-3">
            <button type="button" onClick={() => setConfirm(false)} className="eyebrow text-[#f7f5f1]">Nein</button>
            <button type="button" onClick={() => { deleteBookings(sel); setSel([]); setSelectMode(false); setConfirm(false); }} className="rounded-full bg-destructive px-4 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-destructive-foreground">Löschen</button>
          </span>
        </div>
      )}
    </>
  );
}

const timeCls = cn(inputCls, "h-10 w-28 px-4");

function SettingsTab() {
  const { availability, setDay, blocked, addBlocked, removeBlocked } = useAdminStore();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  return (
    <div className="space-y-12">
      <Section title="Wöchentliche Verfügbarkeit">
        <ul className="divide-y divide-border border-y border-border">
          {availability.map((d, i) => (
            <li key={i} className="flex flex-wrap items-center gap-x-8 gap-y-3 py-5">
              <div className="flex w-44 items-center gap-4">
                <Switch checked={d.enabled} onCheckedChange={(v) => setDay(i, { enabled: v })} aria-label={`${WEEKDAYS_LONG[i]} verfügbar`} />
                <span className={cn("text-sm", !d.enabled && "text-muted-foreground")}>{WEEKDAYS_LONG[i]}</span>
              </div>
              {d.enabled ? (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <input type="time" className={timeCls} value={d.from} onChange={(e) => setDay(i, { from: e.target.value })} aria-label="Von" />
                  <span>bis</span>
                  <input type="time" className={timeCls} value={d.to} onChange={(e) => setDay(i, { to: e.target.value })} aria-label="Bis" />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Nicht verfügbar</span>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Gesperrte Tage">
        <form
          className="grid gap-3 md:grid-cols-[12rem_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!date) return;
            addBlocked(date, reason.trim());
            setDate("");
            setReason("");
          }}
        >
          <input type="date" required className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} aria-label="Datum" />
          <input className={inputCls} placeholder="Grund (optional)" value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Grund" />
          <button type="submit" className="h-11 rounded-full bg-[#211d1b] px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">Tag sperren</button>
        </form>
        {blocked.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">Keine gesperrten Tage.</p>
        ) : (
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {blocked.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                <span><span className="tabular-nums">{fmtDate(b.date)}</span>{b.reason && <span className="ml-4 text-muted-foreground">{b.reason}</span>}</span>
                <button type="button" onClick={() => removeBlocked(b.id)} className="eyebrow inline-flex items-center gap-2 hover:text-foreground" aria-label="Sperre entfernen"><X className="h-3.5 w-3.5" /> Entfernen</button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
