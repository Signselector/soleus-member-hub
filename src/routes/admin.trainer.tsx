import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Chip, PageHeader, inputCls } from "@/components/admin/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useAdminStore } from "@/lib/admin/store";
import type { Trainer } from "@/lib/admin/mock2";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/trainer")({
  head: () => ({ meta: [{ title: "Trainer — SOLEUS Admin" }] }),
  component: Trainers,
});

function Trainers() {
  const { trainers, toggleTrainer } = useAdminStore();
  const [edit, setEdit] = useState<{ t: Trainer | null } | null>(null);
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Management"
        title="Trainer"
        intro="Alle Trainer anzeigen und verwalten."
        actions={
          <button type="button" onClick={() => setEdit({ t: null })} className="inline-flex h-12 items-center gap-3 rounded-full bg-[#211d1b] px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">
            <Plus className="h-4 w-4" strokeWidth={1.5} /> Trainer anlegen
          </button>
        }
      />
      <ul className="divide-y divide-border border-y border-border">
        {trainers.map((t) => (
          <li key={t.id} className={cn("grid gap-3 py-6 md:grid-cols-[1.3fr_1.6fr_1.4fr_auto] md:items-center", !t.active && "opacity-60")}>
            <div>
              <p className="text-lg font-light">{t.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.focus}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>{t.email}</p>
              <p className="mt-1">{t.phone}</p>
            </div>
            <div>
              <Chip t={t.active ? "strong" : "line"}>{t.active ? "Aktiv" : "Inaktiv"}</Chip>
            </div>
            <div className="flex gap-5 md:justify-end">
              <button type="button" onClick={() => setEdit({ t })} className="eyebrow hover:text-foreground">Bearbeiten</button>
              <button type="button" onClick={() => toggleTrainer(t.id)} className="eyebrow hover:text-foreground">{t.active ? "Deaktivieren" : "Aktivieren"}</button>
            </div>
          </li>
        ))}
      </ul>
      {edit && <TrainerDialog trainer={edit.t} onClose={() => setEdit(null)} />}
    </div>
  );
}

function TrainerDialog({ trainer, onClose }: { trainer: Trainer | null; onClose: () => void }) {
  const { saveTrainer } = useAdminStore();
  const [f, setF] = useState({ name: trainer?.name ?? "", email: trainer?.email ?? "", phone: trainer?.phone ?? "", focus: trainer?.focus ?? "" });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg gap-0 rounded-2xl border-0 bg-[#f7f5f1] p-6 md:p-8">
        <DialogTitle className="text-2xl font-light tracking-tight">{trainer ? "Trainer bearbeiten" : "Trainer anlegen"}</DialogTitle>
        <DialogDescription className="mt-2 text-sm text-muted-foreground">Kontaktdaten und Schwerpunkt.</DialogDescription>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            saveTrainer({ ...(trainer ? { id: trainer.id } : {}), ...f, active: trainer?.active ?? true });
            onClose();
          }}
        >
          {([["name", "Name"], ["email", "E-Mail"], ["phone", "Telefon"], ["focus", "Schwerpunkt"]] as const).map(([k, label]) => (
            <label key={k} className="block">
              <span className="eyebrow">{label}</span>
              <input className={cn(inputCls, "mt-2")} required={k === "name" || k === "email"} type={k === "email" ? "email" : "text"} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
            </label>
          ))}
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="h-11 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Abbrechen</button>
            <button type="submit" className="h-11 rounded-full bg-[#211d1b] px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">Speichern</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
