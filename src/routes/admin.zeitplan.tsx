import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";

export const Route = createFileRoute("/admin/zeitplan")({
  component: () => <ModulePage slug="zeitplan" />,
});
