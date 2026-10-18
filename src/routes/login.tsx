import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button, Field } from "@/components/ui-soleus/primitives";
import { useAuthState } from "@/lib/auth-state";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Anmelden — SOLEUS" },
      { name: "description", content: "Melde dich bei deinem SOLEUS Member-Konto an." },
      { property: "og:title", content: "Anmelden — SOLEUS" },
      { property: "og:description", content: "Melde dich bei deinem SOLEUS Member-Konto an." },
    ],
  }),
  component: Login,
});

function Login() {
  const { setUser } = useAuthState();
  const navigate = useNavigate();
  return (
    <AuthLayout eyebrow="Member Area" title="Willkommen zurück." intro="Melde dich an, um deine Trainings zu verwalten.">
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          setUser("member");
          navigate({ to: "/home" });
        }}
      >
        <Field id="email" label="E-Mail" type="email" autoComplete="email" required placeholder="name@beispiel.at" />
        <Field id="password" label="Passwort" type="password" autoComplete="current-password" required />
        <div className="flex justify-end">
          <Link to="/passwort-vergessen" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Passwort vergessen?
          </Link>
        </div>
        <Button type="submit" className="w-full bg-[#211d1b] hover:bg-[#211d1b]/90">Anmelden</Button>
      </form>
      <p className="mt-10 text-sm text-muted-foreground">
        Noch kein Konto?{" "}
        <Link to="/registrieren" className="text-foreground underline underline-offset-4">
          Registrieren
        </Link>
      </p>
    </AuthLayout>
  );
}
