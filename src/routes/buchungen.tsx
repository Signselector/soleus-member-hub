import { createFileRoute } from "@tanstack/react-router";
import { MemberShell } from "@/components/layout/MemberShell";
import { Placeholder } from "@/components/member/Placeholder";

export const Route = createFileRoute("/buchungen")({
  head: () => ({
    meta: [
      { title: "Meine Buchungen — SOLEUS" },
      { name: "description", content: "Hier findest du bald alle kommenden und vergangenen Sessions." },
      { property: "og:title", content: "Meine Buchungen — SOLEUS" },
      { property: "og:description", content: "Hier findest du bald alle kommenden und vergangenen Sessions." },
    ],
  }),
  component: Page,
});

function Page() {
  const content = <Placeholder eyebrow="Buchungen" title="Meine Buchungen" text="Hier findest du bald alle kommenden und vergangenen Sessions." back="/home" />;
  return <MemberShell>{content}</MemberShell>;
}
