import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button, Field } from "@/components/ui-soleus/primitives";

export const Route = createFileRoute("/passwort-vergessen")({
  head: () => ({
    meta: [
      { title: "Passwort vergessen — SOLEUS" },
      { name: "description", content: "Setze das Passwort deines SOLEUS Kontos zurück." },
      { property: "og:title", content: "Passwort vergessen — SOLEUS" },
      { property: "og:description", content: "Setze das Passwort deines SOLEUS Kontos zurück." },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  const [sent, setSent] = useState(false);
  return (
    <AuthLayout
      eyebrow="Passwort"
      title={sent ? "E-Mail ist unterwegs." : "Passwort vergessen?"}
      intro={
        sent
          ? "Falls ein Konto mit dieser Adresse existiert, erhältst du in Kürze einen Link zum Zurücksetzen."
          : "Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen."
      }
    >
      {!sent && (
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <Field id="email" label="E-Mail" type="email" required autoComplete="email" />
          <Button type="submit" className="w-full">Link senden</Button>
        </form>
      )}
      <p className="mt-10 text-sm">
        <Link to="/login" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          ← Zurück zur Anmeldung
        </Link>
      </p>
    </AuthLayout>
  );
}
