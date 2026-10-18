import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ShoppingBag, X } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SignaturePad } from "@/components/onboarding/SignaturePad";
import { Button, Eyebrow, Field } from "@/components/ui-soleus/primitives";
import { Checkbox } from "@/components/ui/checkbox";
import { eur, emptyOnboarding, startGoCardlessCheckout, type OnboardingData } from "@/lib/onboarding";
import { mockAddons, mockGoals, mockPlans } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/anmeldung")({
  validateSearch: (s: Record<string, unknown>): { plan: string } => ({
    plan: typeof s["plan"] === "string" ? s["plan"] : "standard",
  }),
  head: () => ({
    meta: [
      { title: "Anmeldung — SOLEUS" },
      { name: "description", content: "Schließe deine Anmeldung bei SOLEUS in wenigen Schritten ab." },
      { property: "og:title", content: "Anmeldung — SOLEUS" },
      { property: "og:description", content: "Schließe deine Anmeldung bei SOLEUS in wenigen Schritten ab." },
    ],
  }),
  component: Signup,
});

const STEPS = [
  { title: "Persönliche Daten", intro: "Wie dürfen wir dich ansprechen?" },
  { title: "Anschrift", intro: "Wo wohnst du?" },
  { title: "Gesundheit", intro: "Diese Angaben helfen uns, dein Training sicher zu gestalten." },
  { title: "Deine Ziele", intro: "Was möchtest du erreichen?" },
  { title: "Zusatzleistungen", intro: "Optional zu deiner Mitgliedschaft." },
  { title: "Unterschrift", intro: "Bitte bestätige deine Angaben mit deiner Unterschrift." },
  { title: "Bestellung abschließen", intro: "Prüfe deine Auswahl und schließe die Bestellung ab." },
] as const;

const inputBox =
  "mt-3 block h-14 w-full rounded-md border border-border bg-background px-5 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-foreground focus:outline-none";

function Check({ checked, onChange, children, className }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-4 text-base text-foreground", className)}>
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} className="h-6 w-6 rounded-[3px] border-2 border-foreground/80 shadow-none" />
      <span>{children}</span>
    </label>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: "yes" | "no" | ""; onChange: (v: "yes" | "no") => void }) {
  return (
    <fieldset>
      <legend className="text-base text-foreground">{label}</legend>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-xs">
        {(["yes", "no"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={value === v}
            className={cn(
              "h-12 rounded-full border text-[0.6875rem] font-medium uppercase tracking-[0.18em] transition-colors",
              value === v ? "border-[#211d1b] bg-[#211d1b] text-[#f7f5f1]" : "border-foreground/15 hover:bg-secondary",
            )}
          >
            {v === "yes" ? "Ja" : "Nein"}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Signup() {
  const { plan: planId } = Route.useSearch();
  const navigate = useNavigate();
  const plan = mockPlans.find((p) => p.id === planId) ?? mockPlans[0];
  const [step, setStep] = useState(0);
  const [d, setD] = useState<OnboardingData>(() => emptyOnboarding(plan.id));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => setD((p) => ({ ...p, [k]: v }));
  const toggle = (k: "goals" | "addons", v: string) =>
    setD((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));

  const addonTotal = mockAddons.filter((a) => d.addons.includes(a.id)).reduce((n, a) => n + a.price, 0);
  const last = step === STEPS.length - 1;

  const go = (n: number) => {
    setError("");
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 2) {
      if (!d.hasHealthIssues || !d.takesMedication) return setError("Bitte beantworte beide Fragen.");
      if (d.hasHealthIssues === "yes" && !d.healthDetails.trim()) return setError("Bitte beschreibe deine gesundheitlichen Einschränkungen kurz.");
      if (d.takesMedication === "yes" && !d.medicationDetails.trim()) return setError("Bitte nenne die Medikamente, die du regelmäßig einnimmst.");
    }
    if (step === 5 && !d.signature) return setError("Bitte unterschreibe im Feld.");
    if (!last) return go(step + 1);
    setBusy(true);
    const { redirectUrl } = await startGoCardlessCheckout(d);
    if (redirectUrl) window.location.href = redirectUrl;
    else navigate({ to: "/zahlung" });
  };

  return (
    <div className="min-h-screen bg-secondary">
      <PublicHeader back="/mitglied-werden" />
      <div className="mx-auto max-w-3xl px-6 pb-16 md:px-10 md:pb-24">
        <div className="mt-10 md:mt-16">
          <div className="flex items-center justify-between gap-4">
            <Eyebrow>
              Schritt {step + 1} von {STEPS.length}
            </Eyebrow>
            <p className="eyebrow text-foreground">
              {plan.name} · {plan.price} € / Monat
            </p>
          </div>
          <div className="mt-4 h-px w-full bg-foreground/15" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
            <div className="h-px bg-foreground transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <h1 className="mt-10 text-4xl leading-[1.1] font-light tracking-tight md:text-5xl">{STEPS[step]?.title}</h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed font-light text-muted-foreground">{STEPS[step]?.intro}</p>
        </div>

        <form onSubmit={submit} className="mt-10 rounded-2xl bg-[#f7f5f1] p-6 shadow-[0_18px_40px_-18px_rgba(33,29,27,0.3)] md:p-10" key={step}>
          <div className="animate-rise space-y-8">
            {step === 0 && (
              <>
                <div className="grid gap-8 sm:grid-cols-2">
                  <Field id="fn" label="Vorname *" required autoComplete="given-name" value={d.firstName} onChange={(e) => set("firstName", e.target.value)} />
                  <Field id="ln" label="Name *" required autoComplete="family-name" value={d.lastName} onChange={(e) => set("lastName", e.target.value)} />
                </div>
                <Field id="em" label="E-Mail *" type="email" required autoComplete="email" value={d.email} onChange={(e) => set("email", e.target.value)} />
                <div className="grid gap-8 sm:grid-cols-2">
                  <Field id="ph" label="Telefonnummer (optional)" type="tel" autoComplete="tel" placeholder="+43" value={d.phone} onChange={(e) => set("phone", e.target.value)} />
                  <Field id="bd" label="Geburtsdatum (optional)" type="date" autoComplete="bday" value={d.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <Field id="st" label="Straße und Hausnummer *" required autoComplete="street-address" value={d.street} onChange={(e) => set("street", e.target.value)} />
                <div className="grid gap-8 sm:grid-cols-[1fr_2fr]">
                  <Field id="zip" label="Postleitzahl *" required inputMode="numeric" autoComplete="postal-code" value={d.zip} onChange={(e) => set("zip", e.target.value)} />
                  <Field id="ct" label="Stadt *" required autoComplete="address-level2" value={d.city} onChange={(e) => set("city", e.target.value)} />
                </div>
                <Field id="bl" label="Bundesland *" required autoComplete="address-level1" value={d.state} onChange={(e) => set("state", e.target.value)} />
              </>
            )}

            {step === 2 && (
              <>
                <YesNo label="Bestehen derzeit gesundheitliche Einschränkungen?" value={d.hasHealthIssues} onChange={(v) => set("hasHealthIssues", v)} />
                {d.hasHealthIssues === "yes" && (
                  <label className="block">
                    <span className="text-base text-foreground">Welche Einschränkungen bestehen?</span>
                    <textarea rows={3} className={cn(inputBox, "h-auto py-4")} value={d.healthDetails} onChange={(e) => set("healthDetails", e.target.value)} />
                  </label>
                )}
                <hr className="border-0 border-t border-border" />
                <YesNo label="Nehmen Sie regelmäßig Medikamente ein?" value={d.takesMedication} onChange={(v) => set("takesMedication", v)} />
                {d.takesMedication === "yes" && (
                  <label className="block">
                    <span className="text-base text-foreground">Welche Medikamente nimmst du ein?</span>
                    <textarea rows={3} className={cn(inputBox, "h-auto py-4")} value={d.medicationDetails} onChange={(e) => set("medicationDetails", e.target.value)} />
                  </label>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <p className="text-lg text-foreground">Was sind die Hauptziele im Training?</p>
                <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                  {mockGoals.map((g) => (
                    <Check key={g} checked={d.goals.includes(g)} onChange={() => toggle("goals", g)}>
                      {g}
                    </Check>
                  ))}
                </div>
                <label className="block">
                  <span className="text-base text-foreground">Sonstiges</span>
                  <input className={inputBox} placeholder="Weitere Ziele..." value={d.otherGoals} onChange={(e) => set("otherGoals", e.target.value)} />
                </label>
              </>
            )}

            {step === 4 && (
              <>
                <p className="flex items-center gap-3 text-lg text-foreground">
                  <ShoppingBag className="h-5 w-5" strokeWidth={1.5} /> Zusatzleistungen (optional)
                </p>
                <p className="text-base text-muted-foreground">Wähle optionale Zusatzleistungen aus:</p>
                <div className="space-y-4">
                  {mockAddons.map((a) => (
                    <label
                      key={a.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-5 rounded-xl border bg-card px-6 py-5 transition-colors",
                        d.addons.includes(a.id) ? "border-foreground/60" : "border-border hover:border-foreground/30",
                      )}
                    >
                      <Checkbox
                        checked={d.addons.includes(a.id)}
                        onCheckedChange={() => toggle("addons", a.id)}
                        className="h-6 w-6 rounded-[3px] border-2 border-foreground/80 shadow-none"
                      />
                      <span className="flex-1">
                        <span className="block text-base text-foreground">{a.label}</span>
                        {a.note && <span className="mt-1 block text-sm text-muted-foreground">{a.note}</span>}
                      </span>
                      <span className="text-base font-semibold tabular-nums">{a.price.toFixed(2).replace(".", ",")}€</span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    set("addons", []);
                    go(step + 1);
                  }}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-md bg-[#3b2a20] text-base text-[#f7f5f1] transition-colors hover:bg-[#3b2a20]/90"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} /> Keine Zusatzleistungen
                </button>
              </>
            )}

            {step === 5 && <SignaturePad value={d.signature} onChange={(v) => set("signature", v)} />}

            {step === 6 && (
              <>
                <dl className="divide-y divide-border border-y border-border text-base">
                  <div className="flex items-baseline justify-between gap-6 py-4">
                    <dt>
                      <span className="font-medium">{plan.name}</span> <span className="text-muted-foreground">· {plan.perWeek} pro Woche</span>
                    </dt>
                    <dd className="tabular-nums">{plan.price} € / Monat</dd>
                  </div>
                  {mockAddons
                    .filter((a) => d.addons.includes(a.id))
                    .map((a) => (
                      <div key={a.id} className="flex items-baseline justify-between gap-6 py-4">
                        <dt className="text-muted-foreground">{a.label}</dt>
                        <dd className="tabular-nums">{eur(a.price)}</dd>
                      </div>
                    ))}
                  {addonTotal > 0 && (
                    <div className="flex items-baseline justify-between gap-6 py-4 font-medium">
                      <dt>Einmalig (Zusatzleistungen)</dt>
                      <dd className="tabular-nums">{eur(addonTotal)}</dd>
                    </div>
                  )}
                </dl>
                {/* TODO: Rechtstexte (AGB, Datenschutz, Haftung) durch die finalen Texte von SOLEUS ersetzen. */}
                <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
                  <label className="flex cursor-pointer items-start gap-4">
                    <Checkbox checked={d.acceptTerms} onCheckedChange={(v) => set("acceptTerms", v === true)} className="mt-0.5 h-6 w-6 shrink-0 rounded-[3px] border-2 border-foreground/80 shadow-none" />
                    <span>
                      Ich habe die <a href="https://soleus.at" target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-4">Allgemeinen Geschäftsbedingungen</a> und die Widerrufsbelehrung gelesen und akzeptiere sie.
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-4">
                    <Checkbox checked={d.acceptPrivacy} onCheckedChange={(v) => set("acceptPrivacy", v === true)} className="mt-0.5 h-6 w-6 shrink-0 rounded-[3px] border-2 border-foreground/80 shadow-none" />
                    <span>
                      Ich habe die <a href="https://soleus.at" target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-4">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zu.
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-4">
                    <Checkbox checked={d.acceptLiability} onCheckedChange={(v) => set("acceptLiability", v === true)} className="mt-0.5 h-6 w-6 shrink-0 rounded-[3px] border-2 border-foreground/80 shadow-none" />
                    <span>Ich bestätige meine Angaben zur Gesundheit und nutze die Geräte und Räumlichkeiten auf eigene Verantwortung (Haftungsausschluss).</span>
                  </label>
                </div>
              </>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
              {step > 0 ? (
                <Button type="button" variant="outline" onClick={() => go(step - 1)} className="sm:min-w-40">
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Zurück
                </Button>
              ) : (
                <span />
              )}
              <Button
                type="submit"
                disabled={busy || (last && !(d.acceptTerms && d.acceptPrivacy && d.acceptLiability))}
                className="bg-[#211d1b] hover:bg-[#211d1b]/90 sm:min-w-40"
              >
                {last ? "Jetzt kostenpflichtig bestellen" : "Weiter"} <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
