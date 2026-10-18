import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { inputCls, selectCls } from "@/components/admin/ui";
import { dayKey, fullName, parseLocal, toLocalIso } from "@/lib/admin/format";
import { STATUS_LABEL, TYPE_LABEL, type AdminBooking, type BookingStatus, type TrainingType } from "@/lib/admin/mock";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

/** Create (booking = null) or edit a booking. `preset` pre-fills date and time when created from the calendar. */
export function BookingDialog({ booking, onClose, preset }: { booking: AdminBooking | null; onClose: () => void; preset?: { date: string; time: string } }) {
  const { customers, addBooking, updateBooking, setStatus } = useAdminStore();
  const initial = booking ? parseLocal(booking.start) : new Date();
  const [customerId, setCustomerId] = useState(booking?.customerId ?? customers[0]?.id ?? "");
  const [date, setDate] = useState(preset?.date ?? dayKey(initial));
  const [time, setTime] = useState(booking ? toLocalIso(initial).slice(11) : (preset?.time ?? "18:00"));
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
