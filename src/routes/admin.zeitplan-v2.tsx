import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";

export const Route = createFileRoute("/admin/zeitplan-v2")({
  component: () => <ModulePage slug="zeitplan-v2" />,
});
