import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";

export const Route = createFileRoute("/admin/zusatzleistungen")({
  component: () => <ModulePage slug="zusatzleistungen" />,
});
