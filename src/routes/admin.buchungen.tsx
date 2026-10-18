import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { BookingChip, PageHeader, inputCls, selectCls } from "@/components/admin/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { dayKey, fmtDateLong, fmtDayShort, fmtRange, fmtTime, fullName, parseLocal, toLocalIso } from "@/lib/admin/format";
import { STATUS_LABEL, TYPE_LABEL, type AdminBooking, type BookingStatus, type TrainingType } from "@/lib/admin/mock";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/buchungen")({
  head: () => ({ meta: [{ title: "Buchungen — SOLEUS Admin" }] }),
  component: Bookings,
});

type Tab = "all" | "today" | "upcoming" | "past" | "cancelled";
const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "today", label: "Heute" },
  { key: "upcoming", label: "Kommend" },
  { key: "past", label: "Vergangen" },
  { key: "cancelled", label: "Storniert" },
];

function Bookings() {
  const { bookings, customers, deleteBooking } = useAdminStore();
  const [del, setDel] = useState<AdminBooking | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [type, setType] = useState<TrainingType | "">("");
  const [date, setDate] = useState("");
  const [dialog, setDialog] = useState<{ booking: AdminBooking | null } | null>(null);

  const name = (id: string) => {
    const c = customers.find((x) => x.id === id);
    return c ? fullName(c) : "Unbekannt";
  };

  const rows = useMemo(() => {
    if (!now) return [];
    const today = dayKey(now);
    return bookings
      .filter((b) => {
        const d = parseLocal(b.start);
        const k = dayKey(d);
        if (tab === "today" && !(k === today && b.status !== "cancelled")) return false;
        if (tab === "upcoming" && !(d > now && b.status !== "cancelled")) return false;
        if (tab === "past" && !(d <= now && b.status !== "cancelled")) return false;
        if (tab === "cancelled" && b.status !== "cancelled") return false;
        if (status && b.status !== status) return false;
        if (type && b.type !== type) return false;
        if (date && k !== date) return false;
        if (q && !`${name(b.customerId)} ${fmtDayShort(b.start)} ${dayKey(d)} ${fmtTime(b.start)}`.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => (tab === "past" || tab === "all" ? b.start.localeCompare(a.start) : a.start.localeCompare(b.start)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, customers, now, tab, q, status, type, date]);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Management"
        title="Alle Buchungen"
        intro="Alle Kundenbuchungen anzeigen und verwalten."
        actions={
          <button
            type="button"
            onClick={() => setDialog({ booking: null })}
            className="inline-flex h-12 items-center gap-3 rounded-full bg-[#211d1b] px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1] transition-colors hover:bg-[#211d1b]/90"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} /> Neue Buchung
          </button>
        }
      />

      <div className="flex flex-wrap gap-2" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full px-5 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] transition-colors",
              tab === t.key ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <label className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input className={cn(inputCls, "pl-11")} placeholder="Nach Name, Datum oder Zeit suchen" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buchungen suchen" />
        </label>
        <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} aria-label="Datum" />
        <select className={selectCls} value={type} onChange={(e) => setType(e.target.value as TrainingType | "")} aria-label="Trainingsart">
          <option value="">Alle Trainingsarten</option>
          {(Object.keys(TYPE_LABEL) as TrainingType[]).map((t) => (
            <option key={t} value={t}>{TYPE_LABEL[t]}</option>
          ))}
        </select>
        <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value as BookingStatus | "")} aria-label="Status">
          <option value="">Alle Status</option>
          {(Object.keys(STATUS_LABEL) as BookingStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Keine Buchungen für diese Auswahl.</p>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {["Datum", "Zeit", "Kunde", "Trainingsart", "Status", ""].map((h) => (
                    <th key={h} className="px-6 py-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id} className="border-b border-border/70 transition-colors last:border-0 hover:bg-secondary/50">
                    <td className="px-6 py-4 tabular-nums">{fmtDayShort(b.start)}</td>
                    <td className="px-6 py-4 tabular-nums">{fmtRange(b.start, b.durationMin)}</td>
                    <td className="px-6 py-4 font-medium">{name(b.customerId)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{TYPE_LABEL[b.type]} <span className="tabular-nums">({b.session[0]}/{b.session[1]})</span></td>
                    <td className="px-6 py-4"><BookingChip status={b.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-5">
                        <button type="button" onClick={() => setDialog({ booking: b })} className="eyebrow transition-colors hover:text-foreground">Öffnen</button>
                        <button type="button" onClick={() => setDel(b)} aria-label="Buchung löschen" className="text-muted-foreground transition-colors hover:text-destructive"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {rows.map((b) => (
              <li key={b.id}>
                <button type="button" onClick={() => setDialog({ booking: b })} className="w-full rounded-2xl border border-border bg-card p-5 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{name(b.customerId)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{TYPE_LABEL[b.type]} ({b.session[0]}/{b.session[1]})</p>
                    </div>
                    <BookingChip status={b.status} />
                  </div>
                  <p className="mt-4 text-sm tabular-nums">{fmtDayShort(b.start)} · {fmtRange(b.start, b.durationMin)}</p>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="text-xs tabular-nums text-muted-foreground">{rows.length} Buchungen</p>
      <Dialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <DialogContent className="max-w-md gap-0 rounded-2xl border-0 bg-[#f7f5f1] p-6 md:p-8">
          <DialogTitle className="text-2xl font-light tracking-tight">Buchung löschen?</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {del && `${name(del.customerId)} · ${fmtDateLong(parseLocal(del.start))}, ${fmtTime(del.start)} Uhr. Das Löschen kann nicht rückgängig gemacht werden. Zum Korrigieren besser stornieren.`}
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setDel(null)} className="h-11 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Abbrechen</button>
            <button type="button" onClick={() => { if (del) deleteBooking(del.id); setDel(null); }} className="h-11 rounded-full bg-destructive px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-destructive-foreground">Löschen</button>
          </div>
        </DialogContent>
      </Dialog>

      {dialog && <BookingDialog booking={dialog.booking} onClose={() => setDialog(null)} />}
    </div>
  );
}

function BookingDialog({ booking, onClose }: { booking: AdminBooking | null; onClose: () => void }) {
  const { customers, addBooking, updateBooking, setStatus } = useAdminStore();
  const initial = booking ? parseLocal(booking.start) : new Date();
  const [customerId, setCustomerId] = useState(booking?.customerId ?? customers[0]?.id ?? "");
  const [date, setDate] = useState(dayKey(initial));
  const [time, setTime] = useState(booking ? toLocalIso(initial).slice(11) : "18:00");
  const [duration, setDuration] = useState(booking?.durationMin ?? 60);
  const [type, setType] = useState<TrainingType>(booking?.type ?? "private_gym");
  const [stat, setStat] = useState<BookingStatus>(booking?.status ?? "booked");
  const [confirmCancel, setConfirmCancel] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const start = `${date}T${time}`;
    if (booking) {
      updateBooking(booking.id, { start, durationMin: duration, type });
      if (stat !== booking.status) setStatus(booking.id, stat);
    } else {
      addBooking({ customerId, start, durationMin: duration, type, status: stat });
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg gap-0 rounded-2xl border-0 bg-[#f7f5f1] p-6 md:p-8">
        <DialogTitle className="text-2xl font-light tracking-tight">{booking ? "Buchung bearbeiten" : "Neue Buchung"}</DialogTitle>
        <DialogDescription className="mt-2 text-sm text-muted-foreground">
          {booking ? "Termin, Trainingsart oder Status korrigieren." : "Eine Buchung manuell für einen Kunden anlegen."}
        </DialogDescription>
        <form onSubmit={save} className="mt-6 space-y-4">
          <label className="block">
            <span className="eyebrow">Kunde</span>
            <select className={cn(selectCls, "mt-2")} value={customerId} onChange={(e) => setCustomerId(e.target.value)} disabled={!!booking}>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{fullName(c)}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="eyebrow">Datum</span>
              <input type="date" required className={cn(inputCls, "mt-2")} value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="block">
              <span className="eyebrow">Beginn</span>
              <input type="time" required className={cn(inputCls, "mt-2")} value={time} onChange={(e) => setTime(e.target.value)} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="eyebrow">Dauer (Min.)</span>
              <input type="number" min={15} step={15} required className={cn(inputCls, "mt-2")} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </label>
            <label className="block">
              <span className="eyebrow">Trainingsart</span>
              <select className={cn(selectCls, "mt-2")} value={type} onChange={(e) => setType(e.target.value as TrainingType)}>
                {(Object.keys(TYPE_LABEL) as TrainingType[]).map((t) => (
                  <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="eyebrow">Status</span>
            <select className={cn(selectCls, "mt-2")} value={stat} onChange={(e) => setStat(e.target.value as BookingStatus)}>
              {(Object.keys(STATUS_LABEL) as BookingStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            {booking && booking.status !== "cancelled" ? (
              confirmCancel ? (
                <span className="flex items-center gap-3 text-sm">
                  Wirklich stornieren?
                  <button type="button" onClick={() => { setStatus(booking.id, "cancelled"); onClose(); }} className="eyebrow text-destructive underline underline-offset-4">Ja, stornieren</button>
                  <button type="button" onClick={() => setConfirmCancel(false)} className="eyebrow">Nein</button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirmCancel(true)} className="eyebrow text-destructive transition-opacity hover:opacity-70">Buchung stornieren</button>
              )
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="h-11 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Abbrechen</button>
              <button type="submit" className="h-11 rounded-full bg-[#211d1b] px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">Speichern</button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
