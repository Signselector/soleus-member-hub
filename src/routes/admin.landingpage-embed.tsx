import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";

export const Route = createFileRoute("/admin/landingpage-embed")({
  component: () => <ModulePage slug="landingpage-embed" />,
});
