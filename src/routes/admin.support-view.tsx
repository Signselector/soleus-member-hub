import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";

export const Route = createFileRoute("/admin/support-view")({
  component: () => <ModulePage slug="support-view" />,
});
