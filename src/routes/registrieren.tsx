import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button, Field } from "@/components/ui-soleus/primitives";
import { useAuthState } from "@/lib/auth-state";

export const Route = createFileRoute("/registrieren")({
  head: () => ({
    meta: [
      { title: "Registrieren — SOLEUS" },
      { name: "description", content: "Erstelle dein Konto bei SOLEUS Private Gym." },
      { property: "og:title", content: "Registrieren — SOLEUS" },
      { property: "og:description", content: "Erstelle dein Konto bei SOLEUS Private Gym." },
    ],
  }),
  component: Register,
});

function Register() {
  const { setUser } = useAuthState();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [agb, setAgb] = useState(false);

  return (
    <AuthLayout eyebrow="Neues Konto" title="Konto erstellen." intro="In wenigen Schritten zu deinem ersten Training.">
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          if (f.get("pw") !== f.get("pw2")) return setError("Die Passwörter stimmen nicht überein.");
          if (String(f.get("pw")).length < 8) return setError("Das Passwort muss mindestens 8 Zeichen haben.");
          setError("");
          setUser("new");
          navigate({ to: "/willkommen" });
        }}
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Field id="fn" name="fn" label="Vorname" required autoComplete="given-name" />
          <Field id="ln" name="ln" label="Nachname" required autoComplete="family-name" />
        </div>
        <Field id="email" name="email" label="E-Mail" type="email" required autoComplete="email" />
        <Field id="phone" name="phone" label="Telefon" type="tel" required autoComplete="tel" placeholder="+43" />
        <Field id="pw" name="pw" label="Passwort" type="password" required autoComplete="new-password" />
        <Field id="pw2" name="pw2" label="Passwort bestätigen" type="password" required autoComplete="new-password" />
        <label className="flex cursor-pointer items-start gap-4 text-sm leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            checked={agb}
            onChange={(e) => setAgb(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-foreground"
            required
          />
          <span>
            Ich akzeptiere die <a href="https://soleus.at" className="text-foreground underline underline-offset-4">AGB</a> und
            die <a href="https://soleus.at" className="text-foreground underline underline-offset-4">Datenschutzerklärung</a>.
          </span>
        </label>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full bg-[#211d1b] hover:bg-[#211d1b]/90" disabled={!agb}>Registrieren</Button>
      </form>
      <p className="mt-10 text-sm text-muted-foreground">
        Bereits registriert?{" "}
        <Link to="/login" className="text-foreground underline underline-offset-4">Anmelden</Link>
      </p>
    </AuthLayout>
  );
}
