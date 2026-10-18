import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Trash2 } from "lucide-react";
import { BookingDialog } from "@/components/admin/BookingDialog";
import { ScheduleBookings, ScheduleTabs, startHour, type ScheduleTab } from "@/components/admin/ScheduleCommon";
import { LegendItem, MiniChip, SlotCell, Swatch, WeekCalendar, hhmm } from "@/components/admin/WeekCalendar";
import { PageHeader, Section, inputCls } from "@/components/admin/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { dayKey, fullName } from "@/lib/admin/format";
import { v2Key } from "@/lib/admin/mock2";
import type { AdminBooking } from "@/lib/admin/mock";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/zeitplan-v2")({
  head: () => ({ meta: [{ title: "Zeitplan V2 — SOLEUS Admin" }] }),
  component: ScheduleV2,
});

function ScheduleV2() {
  const [tab, setTab] = useState<ScheduleTab>("calendar");
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Planung" title="Zeitplan V2" intro="Private Gym & Coach-Option Verwaltung. V1-Termine werden schreibgeschützt angezeigt." />
      <ScheduleTabs tab={tab} setTab={setTab} />
      {tab === "calendar" && <CalendarTab />}
      {tab === "bookings" && <ScheduleBookings />}
      {tab === "settings" && <SettingsTab />}
    </div>
  );
}

function CalendarTab() {
  const { bookings, customers, availability, blocked, v2, v2Settings, addV2, removeV2 } = useAdminStore();
  const [trainerId, setTrainerId] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [sel, setSel] = useState<string[]>([]);
  const [create, setCreate] = useState<{ date: string; hour: number } | null>(null);
  const [coach, setCoach] = useState(false);
  const [weeks, setWeeks] = useState("1");
  const [open, setOpen] = useState<AdminBooking | null>(null);
  const name = (id: string) => {
    const c = customers.find((x) => x.id === id);
    return c ? fullName(c) : "Unbekannt";
  };

  const cell = (d: Date, h: number) => {
    const k = dayKey(d);
    const range = `${hhmm(h)} - ${hhmm(h + 1)}`;
    const a = availability[(d.getDay() + 6) % 7];
    const isV1 = !!a?.enabled && h >= Number(a.from.slice(0, 2)) && h < Number(a.to.slice(0, 2)) && !blocked.some((b) => b.date === k);
    const b = bookings.find((x) => x.status !== "cancelled" && x.start.slice(0, 10) === k && startHour(x) === h && (!trainerId || x.trainerId === trainerId));
    if (isV1) {
      return (
        <SlotCell
          tone="locked"
          title={`◇ ${range}`}
          sub={b ? `Private Gym ${b.session[0]}/${b.session[1]}` : "Private Gym 0/1"}
          badge={<Lock className="h-3 w-3" strokeWidth={1.5} />}
          chips={b ? <span className="text-[0.625rem]">{name(b.customerId)}</span> : <MiniChip>V1</MiniChip>}
        />
      );
    }
    const key = v2Key(k, h);
    const slot = v2[key];
    if (!slot) return <SlotCell tone="off" title="" onClick={selectMode ? undefined : () => { setCreate({ date: k, hour: h }); setCoach(v2Settings.defaultCoach); setWeeks("1"); }} />;
    const dark = !!b;
    return (
      <SlotCell
        tone={b ? "booked" : "free"}
        title={`◇ ${range}`}
        sub={`Private Gym ${b ? b.session[0] : 0}/1`}
        selected={sel.includes(key)}
        chips={<>{b && <span className="text-[0.625rem]">{name(b.customerId)}</span>}<MiniChip dark={dark}>{slot.coach ? "PG + Coach" : "PG"}</MiniChip><MiniChip dark={dark}>{slot.coach ? "+C" : "-C"}</MiniChip></>}
        badge={!selectMode && !b ? <span role="button" tabIndex={0} aria-label="Slot löschen" onClick={(e) => { e.stopPropagation(); removeV2([key]); }} onKeyDown={(e) => e.key === "Enter" && removeV2([key])} className="opacity-60 hover:text-destructive hover:opacity-100"><Trash2 className="h-3 w-3" strokeWidth={1.5} /></span> : undefined}
        onClick={() => (selectMode ? setSel((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key])) : b ? setOpen(b) : undefined)}
      />
    );
  };

  const submitCreate = () => {
    if (!create) return;
    const n = Math.max(1, Math.min(26, Number(weeks) || 1));
    const base = new Date(`${create.date}T00:00:00`);
    const keys = Array.from({ length: n }, (_, i) => {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i * 7);
      return v2Key(dayKey(d), create.hour);
    });
    addV2(keys, { coach });
    setCreate(null);
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
        onDeleteSelected={() => { removeV2(sel); setSel([]); setSelectMode(false); }}
        legend={
          <>
            <LegendItem swatch={<Swatch cls="border-border bg-secondary/50" />}>Private Gym</LegendItem>
            <LegendItem swatch={<Swatch cls="border-border bg-secondary/50" />}><MiniChip>PG + Coach</MiniChip> Coach-Option</LegendItem>
            <LegendItem swatch={<Swatch cls="border-[#211d1b] bg-[#211d1b]" />}>Gebucht</LegendItem>
            <LegendItem swatch={<Swatch cls="border-border bg-muted" />}>V1 (readonly)</LegendItem>
            <span><MiniChip>+C</MiniChip> Mit Coach</span>
            <span><MiniChip>-C</MiniChip> Ohne Coach</span>
          </>
        }
      />
      <p className="text-xs text-muted-foreground">Leere Zellen anklicken, um einen Slot zu erstellen. Zeiten aus Zeitplan (V1) sind schreibgeschützt.</p>

      <Dialog open={!!create} onOpenChange={(o) => !o && setCreate(null)}>
        <DialogContent className="max-w-md gap-0 rounded-2xl border-0 bg-[#f7f5f1] p-6 md:p-8">
          <DialogTitle className="text-2xl font-light tracking-tight">Slot erstellen</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">{create && `${create.date} · ${hhmm(create.hour)} – ${hhmm(create.hour + 1)} · Private Gym`}</DialogDescription>
          <div className="mt-6 space-y-5">
            <label className="flex items-center justify-between gap-4 text-sm"><span>Coach-Option anbieten</span><Switch checked={coach} onCheckedChange={setCoach} aria-label="Coach-Option" /></label>
            <label className="block"><span className="eyebrow">Wöchentlich wiederholen (Anzahl Wochen)</span>
              <input type="number" min={1} max={26} className={cn(inputCls, "mt-2")} value={weeks} onChange={(e) => setWeeks(e.target.value)} />
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setCreate(null)} className="h-11 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Abbrechen</button>
              <button type="button" onClick={submitCreate} className="h-11 rounded-full bg-[#211d1b] px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">Erstellen</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {open && <BookingDialog booking={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function SettingsTab() {
  const { v2Settings, setV2Settings } = useAdminStore();
  return (
    <Section title="Standardwerte für neue Slots">
      <label className="flex max-w-md items-center justify-between gap-6 border-y border-border py-5 text-sm">
        <span>Coach-Option standardmäßig aktivieren</span>
        <Switch checked={v2Settings.defaultCoach} onCheckedChange={(v) => setV2Settings({ defaultCoach: v })} aria-label="Coach-Option standardmäßig" />
      </label>
      <p className="mt-4 max-w-xl text-xs leading-relaxed text-muted-foreground">Gilt für neu erstellte Slots. Bestehende Slots bleiben unverändert.</p>
    </Section>
  );
}
