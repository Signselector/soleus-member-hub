import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";

export const Route = createFileRoute("/admin/admin-verwaltung")({
  component: () => <ModulePage slug="admin-verwaltung" />,
});
