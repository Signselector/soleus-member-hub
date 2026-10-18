import { createFileRoute } from "@tanstack/react-router";
import { Chip, PageHeader, selectCls } from "@/components/admin/ui";
import { ROLE_LABEL, type AdminRole } from "@/lib/admin/mock2";
import { useAdminStore } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/admin-verwaltung")({
  head: () => ({ meta: [{ title: "Admin Verwaltung — SOLEUS Admin" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  const { adminUsers, setRole } = useAdminStore();
  const superCount = adminUsers.filter((u) => u.role === "super_admin").length;
  return (
    <div className="space-y-10">
      <PageHeader eyebrow="System" title="Admin Verwaltung" intro="Benutzerverwaltung (Super-Admin). Verwalte alle Rollen für Benutzer." actions={<Chip t="line">Nur Super-Admin</Chip>} />
      <ul className="divide-y divide-border border-y border-border">
        {adminUsers.map((u) => {
          const lastSuper = u.role === "super_admin" && superCount <= 1;
          return (
            <li key={u.id} className="grid gap-3 py-6 md:grid-cols-[1.4fr_1.6fr_14rem] md:items-center">
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
            </li>
          );
        })}
      </ul>
      <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
        Rollenänderungen werden im Aktivitätsprotokoll festgehalten. Der letzte Super-Admin kann nicht herabgestuft werden. Echte Rechteprüfung erfolgt serverseitig mit dem Backend.
      </p>
    </div>
  );
}
