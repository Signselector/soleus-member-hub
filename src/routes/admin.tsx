import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStoreProvider } from "@/lib/admin/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — SOLEUS" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminGate>
      <AdminStoreProvider>
        <AdminShell>
          <Outlet />
        </AdminShell>
      </AdminStoreProvider>
    </AdminGate>
  );
}
