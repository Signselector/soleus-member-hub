import { createFileRoute } from "@tanstack/react-router";
import { MemberShell } from "@/components/layout/MemberShell";
import { Placeholder } from "@/components/member/Placeholder";

export const Route = createFileRoute("/family")({
  head: () => ({
    meta: [
      { title: "Family & Friends — SOLEUS" },
      { name: "description", content: "Lade Familie und Freunde zu deinen Sessions ein — folgt in Phase 2." },
      { property: "og:title", content: "Family & Friends — SOLEUS" },
      { property: "og:description", content: "Lade Familie und Freunde zu deinen Sessions ein — folgt in Phase 2." },
    ],
  }),
  component: Page,
});

function Page() {
  const content = <Placeholder eyebrow="Teilen" title="Family & Friends" text="Lade Familie und Freunde zu deinen Sessions ein — folgt in Phase 2." back="/home" />;
  return <MemberShell>{content}</MemberShell>;
}
