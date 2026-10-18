import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Chip, PageHeader, inputCls, selectCls } from "@/components/admin/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ROLE_LABEL, type AdminRole } from "@/lib/admin/mock2";
import { useAdminStore } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/admin-verwaltung")({
  head: () => ({ meta: [{ title: "Admin Verwaltung — SOLEUS Admin" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  const { adminUsers, setRole, addAdminUser, toggleUserActive } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "", role: "trainer" as AdminRole });
  const superCount = adminUsers.filter((u) => u.role === "super_admin").length;
  return (
    <div className="space-y-10">
      <PageHeader eyebrow="System" title="Admin Verwaltung" intro="Benutzerverwaltung (Super-Admin). Verwalte alle Rollen für Benutzer." actions={
        <div className="flex items-center gap-3">
          <Chip t="line">Nur Super-Admin</Chip>
          <button type="button" onClick={() => setOpen(true)} className="inline-flex h-12 items-center gap-3 rounded-full bg-[#211d1b] px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">
            <UserPlus className="h-4 w-4" strokeWidth={1.5} /> Benutzer einladen
          </button>
        </div>
      } />
      <ul className="divide-y divide-border border-y border-border">
        {adminUsers.map((u) => {
          const lastSuper = u.role === "super_admin" && superCount <= 1;
          return (
            <li key={u.id} className={cn("grid gap-3 py-6 md:grid-cols-[1.4fr_1.6fr_14rem_auto] md:items-center", !u.active && "opacity-60")}>
              <p className="text-lg font-light">{u.name}</p>
              <p className="text-sm text-muted-foreground">{u.email}</p>
              <div>
                <select
                  className={selectCls}
                  value={u.role}
                  disabled={lastSuper}
                  onChange={(e) => setRole(u.id, e.target.value as AdminRole)}
                  aria-label={`Rolle für ${u.name}`}
                  title={lastSuper ? "Der letzte Super-Admin kann nicht herabgestuft werden." : undefined}
                >
                  {(Object.keys(ROLE_LABEL) as AdminRole[]).map((r) => (
                    <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                  ))}
                </select>
              </div>
              <button type="button" disabled={lastSuper} onClick={() => toggleUserActive(u.id)} className="eyebrow text-left hover:text-foreground disabled:opacity-40 md:text-right">{u.active ? "Deaktivieren" : "Aktivieren"}</button>
            </li>
          );
        })}
      </ul>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md gap-0 rounded-2xl border-0 bg-[#f7f5f1] p-6 md:p-8">
          <DialogTitle className="text-2xl font-light tracking-tight">Benutzer einladen</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">Mit der Rolle „Trainer" erscheint der Benutzer unter Trainer.</DialogDescription>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              addAdminUser(f);
              setF({ name: "", email: "", phone: "", role: "trainer" });
              setOpen(false);
            }}
          >
            <label className="block"><span className="eyebrow">Name</span><input required className={cn(inputCls, "mt-2")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
            <label className="block"><span className="eyebrow">E-Mail</span><input type="email" required className={cn(inputCls, "mt-2")} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
            <label className="block"><span className="eyebrow">Telefon</span><input className={cn(inputCls, "mt-2")} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
            <label className="block"><span className="eyebrow">Rolle</span>
              <select className={cn(selectCls, "mt-2")} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as AdminRole })}>
                {(Object.keys(ROLE_LABEL) as AdminRole[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </label>
            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Abbrechen</button>
              <button type="submit" className="h-11 rounded-full bg-[#211d1b] px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">Einladen</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
        Rollenänderungen werden im Aktivitätsprotokoll festgehalten. Der letzte Super-Admin kann nicht herabgestuft werden. Echte Rechteprüfung erfolgt serverseitig mit dem Backend.
      </p>
    </div>
  );
}
