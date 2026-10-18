import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { Chip, PageHeader } from "@/components/admin/ui";
import { Switch } from "@/components/ui/switch";
import { V2_HOURS, WEEKDAYS_LONG } from "@/lib/admin/mock2";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/zeitplan-v2")({
  head: () => ({ meta: [{ title: "Zeitplan V2 — SOLEUS Admin" }] }),
  component: ScheduleV2,
});

const hhmm = (h: number) => `${String(h).padStart(2, "0")}:00`;

function ScheduleV2() {
  const { availability, v2, setV2 } = useAdminStore();
  const [day, setDay] = useState(0);

  /** Hours covered by an enabled V1 window are read-only here. */
  const isV1 = (d: number, h: number) => {
    const a = availability[d];
    if (!a?.enabled) return false;
    const from = Number(a.from.slice(0, 2));
    const to = Number(a.to.slice(0, 2));
    return h >= from && h < to;
  };

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Planung" title="Zeitplan V2" intro="Private Gym & Coach-Option verwalten. V1-Termine werden schreibgeschützt angezeigt." />

      <div className="flex flex-wrap gap-2" role="tablist">
        {WEEKDAYS_LONG.map((w, i) => (
          <button
            key={w}
            role="tab"
            aria-selected={day === i}
            onClick={() => setDay(i)}
            className={cn("rounded-full px-5 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] transition-colors", day === i ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary")}
          >
            {w.slice(0, 2)}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-[5rem_1fr_1fr] border-b border-border px-6 py-4 text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground md:grid-cols-[8rem_1fr_1fr_1fr]">
          <span>Zeit</span>
          <span>Private Gym</span>
          <span>Coach-Option</span>
          <span className="hidden md:block">Quelle</span>
        </div>
        <ul>
          {V2_HOURS.map((h) => {
            const locked = isV1(day, h);
            const s = v2[`${day}-${h}`] ?? { privateGym: false, coach: false };
            return (
              <li key={h} className={cn("grid grid-cols-[5rem_1fr_1fr] items-center border-b border-border/70 px-6 py-4 last:border-0 md:grid-cols-[8rem_1fr_1fr_1fr]", locked && "bg-muted/60")}>
                <span className="text-sm tabular-nums">{hhmm(h)}</span>
                <span>
                  <Switch checked={locked ? true : s.privateGym} disabled={locked} onCheckedChange={(v) => setV2(`${day}-${h}`, { privateGym: v })} aria-label={`Private Gym ${hhmm(h)}`} />
                </span>
                <span>
                  <Switch checked={locked ? false : s.coach} disabled={locked} onCheckedChange={(v) => setV2(`${day}-${h}`, { coach: v })} aria-label={`Coach ${hhmm(h)}`} />
                </span>
                <span className="hidden md:block">
                  {locked ? (
                    <Chip t="muted"><Lock className="mr-1.5 h-3 w-3" strokeWidth={1.5} /> V1 · schreibgeschützt</Chip>
                  ) : (
                    <Chip t="line">V2</Chip>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
        Zeiten, die im Zeitplan (V1) als verfügbar eingetragen sind, erscheinen hier gesperrt und werden in V1 gepflegt.
      </p>
    </div>
  );
}
