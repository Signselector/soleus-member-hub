import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthState } from "@/lib/auth-state";
import { Wordmark } from "@/components/ui-soleus/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SOLEUS Member Portal" },
      { name: "description", content: "Die Member Area von SOLEUS Private Gym." },
      { property: "og:title", content: "SOLEUS Member Portal" },
      { property: "og:description", content: "Die Member Area von SOLEUS Private Gym." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user } = useAuthState();
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => {
      navigate({ to: user === "member" ? "/home" : user === "new" ? "/willkommen" : "/login", replace: true });
    }, 50);
    return () => clearTimeout(t);
  }, [user, navigate]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Wordmark />
    </div>
  );
}
