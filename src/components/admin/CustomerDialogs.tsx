import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { inputCls, selectCls } from "@/components/admin/ui";
import { fmtDate, fullName } from "@/lib/admin/format";
import { PLAN_INFO, type AdminCustomer, type PlanId } from "@/lib/admin/mock";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

const btnGhost = "h-11 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary";
const btnDark = "h-11 rounded-full bg-[#211d1b] px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]";

function Shell({ title, desc, onClose, children, wide }: { title: string; desc?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={cn("gap-0 rounded-2xl border-0 bg-[#f7f5f1] p-6 md:p-8", wide ? "max-w-xl" : "max-w-md")}>
        <DialogTitle className="text-2xl font-light tracking-tight">{title}</DialogTitle>
        <DialogDescription className="mt-2 text-sm text-muted-foreground">{desc ?? ""}</DialogDescription>
        <div className="mt-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export const COACHING_LABELS = ["PT 1:1 Einzel", "PT 1:1 Duo", "Premium Coaching"] as const;

/** "+ Block": add coaching units. */
export function BlockDialog({ customer, onClose }: { customer: AdminCustomer; onClose: () => void }) {
  const { addBlock } = useAdminStore();
  const [hours, setHours] = useState("10");
  const [until, setUntil] = useState("");
  const [label, setLabel] = useState<string>(customer.block?.label ?? COACHING_LABELS[0]);
  return (
    <Shell title="Block hinzufügen" desc={`Coaching-Einheiten für ${fullName(customer)}.`} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          addBlock(customer.id, Number(hours), until, label);
          onClose();
        }}
      >
        <label className="block"><span className="eyebrow">Coaching</span>
          <select className={cn(selectCls, "mt-2")} value={label} onChange={(e) => setLabel(e.target.value)}>
            {COACHING_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block"><span className="eyebrow">Einheiten</span>
            <input type="number" min={1} required className={cn(inputCls, "mt-2")} value={hours} onChange={(e) => setHours(e.target.value)} />
          </label>
          <label className="block"><span className="eyebrow">Gültig bis</span>
            <input type="date" className={cn(inputCls, "mt-2")} value={until} onChange={(e) => setUntil(e.target.value)} />
          </label>
        </div>
        <div className="flex justify-end gap-3 pt-3"><button type="button" onClick={onClose} className={btnGhost}>Abbrechen</button><button type="submit" className={btnDark}>Hinzufügen</button></div>
      </form>
    </Shell>
  );
}

/** "+ PG": add Private Gym units. */
export function PGDialog({ customer, onClose }: { customer: AdminCustomer; onClose: () => void }) {
  const { addPG } = useAdminStore();
  const [units, setUnits] = useState("5");
  const [until, setUntil] = useState("");
  return (
    <Shell title="Private Gym hinzufügen" desc={`Private-Gym-Einheiten für ${fullName(customer)}.`} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          addPG(customer.id, Number(units), until);
          onClose();
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <label className="block"><span className="eyebrow">Einheiten</span>
            <input type="number" min={1} required className={cn(inputCls, "mt-2")} value={units} onChange={(e) => setUnits(e.target.value)} />
          </label>
          <label className="block"><span className="eyebrow">Gültig bis</span>
            <input type="date" className={cn(inputCls, "mt-2")} value={until} onChange={(e) => setUntil(e.target.value)} />
          </label>
        </div>
        <div className="flex justify-end gap-3 pt-3"><button type="button" onClick={onClose} className={btnGhost}>Abbrechen</button><button type="submit" className={btnDark}>Hinzufügen</button></div>
      </form>
    </Shell>
  );
}

/** Read-only view of the sign-up form. */
export function FormDialog({ customer, onClose }: { customer: AdminCustomer; onClose: () => void }) {
  const f = customer.form;
  const rows: [string, string][] = [
    ["Name", fullName(customer)],
    ["E-Mail", customer.email],
    ["Telefon", customer.phone],
    ["Geburtsdatum", f.birthDate ? fmtDate(f.birthDate) : "—"],
    ["Anschrift", [f.street, `${f.zip} ${f.city}`.trim(), f.state].filter(Boolean).join(", ") || "—"],
    ["Gesundheitliche Einschränkungen", f.healthIssues || "—"],
    ["Regelmäßige Medikamente", f.medication || "—"],
    ["Ziele", f.goals.join(", ") || "—"],
    ["Registriert am", fmtDate(customer.since)],
  ];
  return (
    <Shell title="Anmeldeformular" desc={fullName(customer)} onClose={onClose} wide>
      <dl className="divide-y divide-border border-y border-border">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-3.5 sm:grid-cols-[12rem_1fr]">
            <dt className="eyebrow text-[0.625rem]">{k}</dt>
            <dd className="text-sm">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex justify-end"><button type="button" onClick={onClose} className={btnGhost}>Schließen</button></div>
    </Shell>
  );
}

export function CreateCustomerDialog({ onClose }: { onClose: () => void }) {
  const { createCustomer } = useAdminStore();
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", phone: "", plan: "standard" as PlanId });
  return (
    <Shell title="Kunde erstellen" desc="Legt einen Kunden manuell an." onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          createCustomer(f);
          onClose();
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <label className="block"><span className="eyebrow">Vorname</span><input required className={cn(inputCls, "mt-2")} value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></label>
          <label className="block"><span className="eyebrow">Nachname</span><input required className={cn(inputCls, "mt-2")} value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></label>
        </div>
        <label className="block"><span className="eyebrow">E-Mail</span><input type="email" required className={cn(inputCls, "mt-2")} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label className="block"><span className="eyebrow">Telefon</span><input className={cn(inputCls, "mt-2")} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
        <label className="block"><span className="eyebrow">Abo</span>
          <select className={cn(selectCls, "mt-2")} value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value as PlanId })}>
            {(Object.keys(PLAN_INFO) as PlanId[]).map((p) => <option key={p} value={p}>{PLAN_INFO[p].name}</option>)}
          </select>
        </label>
        <div className="flex justify-end gap-3 pt-3"><button type="button" onClick={onClose} className={btnGhost}>Abbrechen</button><button type="submit" className={btnDark}>Erstellen</button></div>
      </form>
    </Shell>
  );
}

export function DeleteCustomerDialog({ customer, onClose }: { customer: AdminCustomer; onClose: () => void }) {
  const { deleteCustomer } = useAdminStore();
  return (
    <Shell title="Kunde löschen?" desc={`${fullName(customer)} und alle Buchungen werden entfernt. Das kann nicht rückgängig gemacht werden. GoCardless-Mandate werden dabei nicht gelöscht.`} onClose={onClose}>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className={btnGhost}>Abbrechen</button>
        <button type="button" onClick={() => { deleteCustomer(customer.id); onClose(); }} className="h-11 rounded-full bg-destructive px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-destructive-foreground">Löschen</button>
      </div>
    </Shell>
  );
}
