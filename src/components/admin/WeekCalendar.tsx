import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Filter, Trash2 } from "lucide-react";
import { selectCls } from "@/components/admin/ui";
import { dayKey } from "@/lib/admin/format";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const CAL_HOURS = Array.from({ length: 17 }, (_, i) => i + 5); // 05:00 – 21:00
const WD = ["Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa.", "So."];
export const hhmm = (h: number) => `${String(h).padStart(2, "0")}:00`;

const mondayOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export function weekLabel(monday: Date) {
  const end = addDays(monday, 6);
  const m = end.toLocaleDateString("de-AT", { month: "long", year: "numeric" });
  return `${monday.getDate()} - ${end.getDate()} ${m}`;
}

/** Visual building block for one hour cell. */
export function SlotCell({ tone, title, sub, chips, onClick, selected, badge }: {
  tone: "free" | "booked" | "fix" | "locked" | "off";
  title: string;
  sub?: ReactNode;
  chips?: ReactNode;
  onClick?: (() => void) | undefined;
  selected?: boolean | undefined;
  badge?: ReactNode;
}) {
  const cls = {
    free: "border-border/70 bg-secondary/50 text-foreground/70 hover:bg-secondary",
    booked: "border-[#211d1b] bg-[#211d1b] text-[#f7f5f1]",
    fix: "border-border/70 bg-[#f0e8d6] text-foreground/70",
    locked: "border-border/70 bg-muted text-muted-foreground",
    off: "border-transparent bg-transparent text-transparent",
  }[tone];
  const inner = (
    <>
      <span className="flex items-center justify-between gap-1 text-[0.6875rem] font-medium tabular-nums">{title}{badge}</span>
      {sub && <span className="mt-0.5 block text-[0.625rem] opacity-80">{sub}</span>}
      {chips && <span className="mt-1 flex flex-wrap items-center gap-1">{chips}</span>}
    </>
  );
  const base = cn("block h-full w-full rounded-md border px-2 py-1.5 text-left transition-colors", cls, selected && "ring-2 ring-[#a8693a] ring-offset-1");
  if (tone === "off") {
    return onClick ? (
      <button type="button" onClick={onClick} aria-label="Slot erstellen" className="h-full w-full rounded-md border border-dashed border-transparent text-center text-lg text-transparent transition-colors hover:border-border hover:text-muted-foreground">+</button>
    ) : (
      <div className="h-full w-full" aria-hidden />
    );
  }
  return onClick ? <button type="button" onClick={onClick} className={base}>{inner}</button> : <div className={base}>{inner}</div>;
}

export const MiniChip = ({ children, dark }: { children: ReactNode; dark?: boolean }) => (
  <span className={cn("rounded px-1 py-px text-[0.5625rem] font-semibold", dark ? "bg-white/15" : "bg-foreground/10")}>{children}</span>
);

/** Week grid with trainer filter, bulk-delete toggle and navigation. */
export function WeekCalendar({ renderCell, legend, selectedCount, selectMode, setSelectMode, onDeleteSelected, trainerId, setTrainerId }: {
  renderCell: (day: Date, hour: number) => ReactNode;
  legend: ReactNode;
  selectedCount: number;
  selectMode: boolean;
  setSelectMode: (v: boolean) => void;
  onDeleteSelected: () => void;
  trainerId: string;
  setTrainerId: (v: string) => void;
}) {
  const { trainers } = useAdminStore();
  const [monday, setMonday] = useState(() => mondayOf(new Date()));
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(monday, i)), [monday]);
  const today = dayKey(new Date());

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-6">
        <h2 className="text-xl font-light tracking-tight">{weekLabel(monday)}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 text-muted-foreground"><Filter className="h-4 w-4" strokeWidth={1.5} /></span>
          <select className={cn(selectCls, "h-10 w-44")} value={trainerId} onChange={(e) => setTrainerId(e.target.value)} aria-label="Trainer filtern">
            <option value="">Alle Trainer</option>
            {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {selectMode ? (
            <>
              <button type="button" disabled={selectedCount === 0} onClick={onDeleteSelected} className="inline-flex h-10 items-center gap-2 rounded-full bg-destructive px-4 text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-destructive-foreground disabled:opacity-40">
                <Trash2 className="h-3.5 w-3.5" /> {selectedCount} löschen
              </button>
              <button type="button" onClick={() => setSelectMode(false)} className="h-10 rounded-full border border-foreground/15 px-4 text-[0.6875rem] font-medium uppercase tracking-[0.15em] hover:bg-secondary">Abbrechen</button>
            </>
          ) : (
            <button type="button" onClick={() => setSelectMode(true)} className="inline-flex h-10 items-center gap-2 rounded-full border border-foreground/15 px-4 text-[0.6875rem] font-medium uppercase tracking-[0.15em] hover:bg-secondary">
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} /> Mehrfach löschen
            </button>
          )}
          <button type="button" onClick={() => setMonday((m) => addDays(m, -7))} aria-label="Vorherige Woche" className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-secondary"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => setMonday(mondayOf(new Date()))} className="h-10 rounded-full border border-border px-4 text-[0.6875rem] font-medium uppercase tracking-[0.15em] hover:bg-secondary">Heute</button>
          <button type="button" onClick={() => setMonday((m) => addDays(m, 7))} aria-label="Nächste Woche" className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-secondary"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-auto border-t border-border">
        <div className="grid min-w-[860px] grid-cols-[4rem_repeat(7,minmax(0,1fr))]">
          <div className="sticky top-0 z-10 border-b border-border bg-card px-2 py-3 text-center text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground">Zeit</div>
          {days.map((d, i) => (
            <div key={i} className={cn("sticky top-0 z-10 border-b border-l border-border px-2 py-3 text-center", dayKey(d) === today ? "bg-secondary" : "bg-card")}>
              <p className="text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground">{WD[i]}</p>
              <p className="mt-0.5 text-lg font-light tabular-nums">{d.getDate()}</p>
            </div>
          ))}
          {CAL_HOURS.map((h) => (
            <div key={h} className="contents">
              <div className="border-b border-border/60 px-2 py-2 text-center text-[0.6875rem] tabular-nums text-muted-foreground">{hhmm(h)}</div>
              {days.map((d, i) => (
                <div key={i} className={cn("min-h-[4.5rem] border-b border-l border-border/60 p-1", dayKey(d) === today && "bg-secondary/30")}>{renderCell(d, h)}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border px-5 py-4 text-xs text-muted-foreground md:px-6">{legend}</div>
    </div>
  );
}

export function LegendItem({ swatch, children }: { swatch: ReactNode; children: ReactNode }) {
  return <span className="inline-flex items-center gap-2">{swatch}{children}</span>;
}
export const Swatch = ({ cls }: { cls: string }) => <span className={cn("inline-block h-3.5 w-3.5 rounded border", cls)} />;
