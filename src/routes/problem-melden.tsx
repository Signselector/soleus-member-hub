import { createFileRoute } from "@tanstack/react-router";
import { MemberShell } from "@/components/layout/MemberShell";
import { Placeholder } from "@/components/member/Placeholder";

export const Route = createFileRoute("/problem-melden")({
  head: () => ({
    meta: [
      { title: "Problem melden — SOLEUS" },
      { name: "description", content: "Melde Schäden oder Probleme im Gym — folgt in Phase 2." },
      { property: "og:title", content: "Problem melden — SOLEUS" },
      { property: "og:description", content: "Melde Schäden oder Probleme im Gym — folgt in Phase 2." },
    ],
  }),
  component: Page,
});

function Page() {
  const content = <Placeholder eyebrow="Schadensmeldung" title="Problem melden" text="Melde Schäden oder Probleme im Gym — folgt in Phase 2." back="/home" />;
  return <MemberShell>{content}</MemberShell>;
}
