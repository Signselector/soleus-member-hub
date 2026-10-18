import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Mail, Search, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { Chip, PageHeader, inputCls } from "@/components/admin/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { fmtDate } from "@/lib/admin/format";
import { ROLE_LABEL, TOGGLE_ROLES, type AdminRole, type AppUser } from "@/lib/admin/mock2";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/admin-verwaltung")({
  head: () => ({ meta: [{ title: "Benutzerverwaltung — SOLEUS Admin" }] }),
  component: Users,
});

function Users() {
  const { users, grantRole, revokeRole, addAdminUser, deleteUser } = useAdminStore();
  const [q, setQ] = useState("");
  const [create, setCreate] = useState(false);
  const [del, setDel] = useState<AppUser | null>(null);
  const [f, setF] = useState({ name: "", email: "", phone: "", roles: [] as AdminRole[] });

  const rows = useMemo(() => users.filter((u) => !q || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())), [users, q]);
  const count = (r: AdminRole) => users.filter((u) => u.roles.includes(r)).length;
  const superCount = count("super_admin");

  /** The last super-admin can never lose the role or be deleted. */
  const locked = (u: AppUser) => u.roles.includes("super_admin") && superCount <= 1;

  const RoleButtons = ({ u }: { u: AppUser }) => (
    <div className="flex flex-wrap items-center gap-1.5">
      {TOGGLE_ROLES.map((r) => {
        const has = u.roles.includes(r);
        const protectedRole = r === "admin" && locked(u);
        return (
          <button
            key={r}
            type="button"
            disabled={protectedRole}
            aria-pressed={has}
            aria-label={`${ROLE_LABEL[r]} ${has ? "entziehen" : "zuweisen"} (${u.name})`}
            title={protectedRole ? "Der letzte Super-Admin behält die Admin-Rolle." : `${ROLE_LABEL[r]} ${has ? "entziehen" : "zuweisen"}`}
            onClick={() => (has ? revokeRole(u.id, r) : grantRole(u.id, r))}
            className={cn(
              "h-9 rounded-full border px-3.5 text-[0.625rem] font-medium uppercase tracking-[0.15em] transition-colors disabled:opacity-40",
              has ? "border-[#211d1b] bg-[#211d1b] text-[#f7f5f1]" : "border-foreground/15 hover:bg-secondary",
            )}
          >
            {ROLE_LABEL[r]}
          </button>
        );
      })}
      <button type="button" disabled={locked(u)} onClick={() => setDel(u)} aria-label={`${u.name} löschen`} className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40">
        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  );

  const RoleChips = ({ u }: { u: AppUser }) => (
    <div className="flex flex-wrap gap-1.5">
      {u.kind === "customer" && <Chip t="soft">Benutzer</Chip>}
      {u.roles.map((r) => <Chip key={r} t={r === "super_admin" ? "strong" : "line"}>{ROLE_LABEL[r]}</Chip>)}
    </div>
  );

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="System"
        title="Benutzerverwaltung"
        intro="Super-Admin: Verwalte alle Rollen für Benutzer."
        actions={
          <button type="button" onClick={() => setCreate(true)} className="inline-flex h-12 items-center gap-3 rounded-full bg-[#211d1b] px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">
            <UserPlus className="h-4 w-4" strokeWidth={1.5} /> Benutzer erstellen
          </button>
        }
      />

      <label className="relative block max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
        <input className={cn(inputCls, "pl-11")} placeholder="Nach Name oder E-Mail suchen" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Benutzer suchen" />
      </label>

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
        <span className="text-lg font-light">Benutzer ({users.length})</span>
        <span className="text-xs text-muted-foreground">· {count("admin")} Admins · {count("trainer")} Trainer · {count("logfile")} Logfile</span>
      </p>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Keine Benutzer gefunden.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card lg:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {["Name", "E-Mail", "Rollen", "Aktionen"].map((h) => <th key={h} className="px-5 py-4 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-b border-border/70 align-middle last:border-0">
                    <td className="px-5 py-4"><p className="font-medium">{u.name}</p><p className="mt-0.5 text-xs tabular-nums text-muted-foreground">seit {fmtDate(u.since)}</p></td>
                    <td className="px-5 py-4"><span className="inline-flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" strokeWidth={1.5} />{u.email}</span></td>
                    <td className="px-5 py-4"><RoleChips u={u} /></td>
                    <td className="px-5 py-4"><RoleButtons u={u} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-3 lg:hidden">
            {rows.map((u) => (
              <li key={u.id} className="rounded-2xl border border-border bg-card p-5">
                <p className="font-medium">{u.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{u.email} · seit {fmtDate(u.since)}</p>
                <div className="mt-3"><RoleChips u={u} /></div>
                <div className="mt-4"><RoleButtons u={u} /></div>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
        Rollenänderungen werden im Aktivitätsprotokoll festgehalten. Der letzte Super-Admin behält seine Rechte und kann nicht gelöscht werden. Die echte Rechteprüfung erfolgt serverseitig mit dem Backend.
      </p>

      <Dialog open={create} onOpenChange={setCreate}>
        <DialogContent className="max-w-md gap-0 rounded-2xl border-0 bg-[#f7f5f1] p-6 md:p-8">
          <DialogTitle className="text-2xl font-light tracking-tight">Benutzer erstellen</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">Mit der Rolle „Trainer" erscheint der Benutzer unter Trainer.</DialogDescription>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              addAdminUser(f);
              setF({ name: "", email: "", phone: "", roles: [] });
              setCreate(false);
            }}
          >
            <label className="block"><span className="eyebrow">Name</span><input required className={cn(inputCls, "mt-2")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
            <label className="block"><span className="eyebrow">E-Mail</span><input type="email" required className={cn(inputCls, "mt-2")} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
            <label className="block"><span className="eyebrow">Telefon</span><input className={cn(inputCls, "mt-2")} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
            <fieldset>
              <legend className="eyebrow">Rollen</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {TOGGLE_ROLES.map((r) => {
                  const on = f.roles.includes(r);
                  return (
                    <button key={r} type="button" aria-pressed={on} onClick={() => setF({ ...f, roles: on ? f.roles.filter((x) => x !== r) : [...f.roles, r] })} className={cn("h-9 rounded-full border px-4 text-[0.625rem] font-medium uppercase tracking-[0.15em]", on ? "border-[#211d1b] bg-[#211d1b] text-[#f7f5f1]" : "border-foreground/15 hover:bg-secondary")}>{ROLE_LABEL[r]}</button>
                  );
                })}
              </div>
            </fieldset>
            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={() => setCreate(false)} className="h-11 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Abbrechen</button>
              <button type="submit" className="h-11 rounded-full bg-[#211d1b] px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">Erstellen</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <DialogContent className="max-w-md gap-0 rounded-2xl border-0 bg-[#f7f5f1] p-6 md:p-8">
          <DialogTitle className="text-2xl font-light tracking-tight">Benutzer löschen?</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">{del && `${del.name} (${del.email})${del.kind === "customer" ? " und alle Buchungen werden entfernt. GoCardless-Mandate bleiben unberührt." : " wird entfernt."} Das kann nicht rückgängig gemacht werden.`}</DialogDescription>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setDel(null)} className="h-11 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Abbrechen</button>
            <button type="button" onClick={() => { if (del) deleteUser(del.id); setDel(null); }} className="h-11 rounded-full bg-destructive px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-destructive-foreground">Löschen</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
