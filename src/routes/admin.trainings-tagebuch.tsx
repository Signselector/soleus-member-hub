import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, Section, inputCls, selectCls } from "@/components/admin/ui";
import { dayKey, fmtDate, fullName } from "@/lib/admin/format";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/trainings-tagebuch")({
  head: () => ({ meta: [{ title: "Trainings Tagebuch — SOLEUS Admin" }] }),
  component: Diary,
});

function Diary() {
  const { diary, customers, trainers, addDiary, removeDiary } = useAdminStore();
  const [cid, setCid] = useState("");
  const [cq, setCq] = useState("");
  const [f, setF] = useState({ date: dayKey(new Date()), trainerId: trainers[0]?.id ?? "", title: "", notes: "", weight: "" });
  const entries = diary.filter((d) => d.customerId === cid).sort((a, b) => b.date.localeCompare(a.date));
  const trainer = (id: string) => trainers.find((t) => t.id === id)?.name ?? "—";
  const weights = [...entries].reverse().filter((e) => e.weightKg !== null);

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Training" title="Trainings Tagebuch" intro="Trainingsfortschritte der Kunden verwalten." />
      <div>
        <p className="eyebrow text-foreground">Kunde auswählen</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[2fr_1.4fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
            <input className={cn(inputCls, "pl-11")} placeholder="Kunde suchen" value={cq} onChange={(e) => setCq(e.target.value)} aria-label="Kunde suchen" />
          </label>
          <select className={selectCls} value={cid} onChange={(e) => setCid(e.target.value)} aria-label="Kunde">
            <option value="">Kunde wählen</option>
            {customers.filter((c) => !cq || `${fullName(c)} ${c.email}`.toLowerCase().includes(cq.toLowerCase())).map((c) => (
              <option key={c.id} value={c.id}>{fullName(c)}</option>
            ))}
          </select>
        </div>
      </div>
      {!cid && <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Wähle einen Kunden aus, um das Trainings Tagebuch anzuzeigen.</p>}
      {cid && (<>

      {weights.length > 1 && (
        <p className="text-sm text-muted-foreground">
          Gewicht: <span className="tabular-nums text-foreground">{weights[0]!.weightKg} kg → {weights[weights.length - 1]!.weightKg} kg</span>
        </p>
      )}

      <Section title="Neuer Eintrag">
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            addDiary({ customerId: cid, date: f.date, trainerId: f.trainerId, title: f.title.trim(), notes: f.notes.trim(), weightKg: f.weight ? Number(f.weight.replace(",", ".")) : null });
            setF({ ...f, title: "", notes: "", weight: "" });
          }}
        >
          <input type="date" required className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} aria-label="Datum" />
          <select className={selectCls} value={f.trainerId} onChange={(e) => setF({ ...f, trainerId: e.target.value })} aria-label="Trainer">
            {trainers.filter((t) => t.active).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <input required className={inputCls} placeholder="Titel (z. B. Oberkörper Kraft)" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} aria-label="Titel" />
          <input className={inputCls} inputMode="decimal" placeholder="Gewicht in kg (optional)" value={f.weight} onChange={(e) => setF({ ...f, weight: e.target.value })} aria-label="Gewicht" />
          <textarea className={cn(inputCls, "h-28 rounded-2xl py-4 md:col-span-2")} placeholder="Notizen, Übungen, Fortschritt" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} aria-label="Notizen" />
          <div className="md:col-span-2">
            <button type="submit" className="h-11 rounded-full bg-[#211d1b] px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">Eintrag speichern</button>
          </div>
        </form>
      </Section>

      <Section title="Verlauf">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Einträge für diesen Kunden.</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {entries.map((e) => (
              <li key={e.id} className="grid gap-3 py-6 md:grid-cols-[9rem_1fr_auto]">
                <p className="text-sm tabular-nums text-muted-foreground">{fmtDate(e.date)}</p>
                <div>
                  <p className="text-base font-medium">{e.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.notes || "—"}</p>
                  <p className="mt-3 text-xs text-muted-foreground">{trainer(e.trainerId)}{e.weightKg !== null && ` · ${e.weightKg} kg`}</p>
                </div>
                <button type="button" onClick={() => removeDiary(e.id)} className="eyebrow self-start hover:text-destructive">Löschen</button>
              </li>
            ))}
          </ul>
        )}
      </Section>
      </>)}
    </div>
  );
}
