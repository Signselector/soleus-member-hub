import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { PageHeader, Section, inputCls } from "@/components/admin/ui";
import { Switch } from "@/components/ui/switch";
import { fmtDate } from "@/lib/admin/format";
import { WEEKDAYS_LONG } from "@/lib/admin/mock2";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/zeitplan")({
  head: () => ({ meta: [{ title: "Zeitplan — SOLEUS Admin" }] }),
  component: Schedule,
});

const timeCls = cn(inputCls, "h-10 w-28 px-4");

function Schedule() {
  const { availability, setDay, blocked, addBlocked, removeBlocked } = useAdminStore();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  return (
    <div className="space-y-12">
      <PageHeader eyebrow="Planung" title="Zeitplan" intro="Lege deine wöchentliche Verfügbarkeit fest und sperre bestimmte Tage." />

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
