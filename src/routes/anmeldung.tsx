import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, Pencil, ShoppingBag, Users, X } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SignaturePad } from "@/components/onboarding/SignaturePad";
import { Button, Eyebrow, Field } from "@/components/ui-soleus/primitives";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { eur, emptyOnboarding, startGoCardlessCheckout, type OnboardingData } from "@/lib/onboarding";
import { austrianStates, mockAddons, mockFamilyFriends, mockGoals, mockPlans } from "@/lib/mock-data";
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
  { title: "Family & Friends", intro: "Bringe deine Liebsten mit ins Studio." },
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
  const { plan: initialPlan } = Route.useSearch();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<OnboardingData>(() => emptyOnboarding((mockPlans.find((p) => p.id === initialPlan) ?? mockPlans[0]).id));
  const [planOpen, setPlanOpen] = useState(false);
  const plan = mockPlans.find((p) => p.id === d.planId) ?? mockPlans[0];
  const changePlan = (id: string) => {
    set("planId", id);
    setPlanOpen(false);
    navigate({ to: "/anmeldung", search: { plan: id }, replace: true });
  };
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
    if (step === 6 && !d.signature) return setError("Bitte unterschreibe im Feld.");
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
          <Eyebrow>
            Schritt {step + 1} von {STEPS.length}
          </Eyebrow>
          <div className="mt-4 h-px w-full bg-foreground/15" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
            <div className="h-px bg-foreground transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-2xl bg-[#211d1b] px-6 py-5 text-[#f7f5f1] shadow-[0_18px_40px_-18px_rgba(33,29,27,0.45)] md:px-8">
            <div>
              <p className="text-[0.625rem] font-bold uppercase tracking-[0.3em] text-[#f7f5f1]/70">Dein Paket</p>
              <p className="mt-2 flex flex-wrap items-baseline gap-x-3">
                <span className="text-2xl font-medium tracking-tight">{plan.name}</span>
                <span className="text-sm font-light text-[#f7f5f1]/75">{plan.perWeek} pro Woche</span>
              </p>
            </div>
            <div className="flex items-center gap-5">
              <p className="flex items-baseline gap-1.5">
                <span className="text-3xl font-light tabular-nums">{plan.price}</span>
                <span className="text-sm font-light text-[#f7f5f1]/75">€ / Monat</span>
              </p>
              <Dialog open={planOpen} onOpenChange={setPlanOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-[#e8dfcd] px-5 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-[#3b2a20] transition-colors hover:bg-[#e8dfcd]/90"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} /> Ändern
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-lg gap-0 rounded-2xl border-0 bg-[#f7f5f1] p-6 md:p-8">
                  <DialogTitle className="text-2xl font-light tracking-tight">Paket ändern</DialogTitle>
                  <DialogDescription className="mt-2 text-sm text-muted-foreground">Wähle das Paket, das besser zu dir passt.</DialogDescription>
                  <div className="mt-6 space-y-3">
                    {mockPlans.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => changePlan(p.id)}
                        aria-pressed={p.id === plan.id}
                        className={cn(
                          "flex w-full items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition-colors",
                          p.id === plan.id ? "border-[#211d1b] bg-[#211d1b] text-[#f7f5f1]" : "border-border bg-card hover:border-foreground/40",
                        )}
                      >
                        <span>
                          <span className="block text-base font-medium">{p.name}</span>
                          <span className={cn("block text-sm font-light", p.id === plan.id ? "text-[#f7f5f1]/75" : "text-muted-foreground")}>{p.perWeek} pro Woche</span>
                        </span>
                        <span className="tabular-nums">{p.price} € / Monat</span>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <h1 className="mt-12 text-4xl leading-[1.1] font-light tracking-tight md:text-5xl">{STEPS[step]?.title}</h1>
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
                <label htmlFor="bl" className="block">
                  <span className="eyebrow">Bundesland *</span>
                  <span className="relative mt-2 block">
                    <select
                      id="bl"
                      required
                      autoComplete="address-level1"
                      value={d.state}
                      onChange={(e) => set("state", e.target.value)}
                      className={cn("block h-12 w-full cursor-pointer appearance-none border-0 border-b border-border bg-transparent pr-8 text-base transition-colors focus:border-foreground focus:outline-none", d.state ? "text-foreground" : "text-muted-foreground/60")}
                    >
                      <option value="">Bitte wählen</option>
                      {austrianStates.map((b) => (
                        <option key={b} value={b} className="text-foreground">
                          {b}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                  </span>
                </label>
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

            {step === 5 && (
              <>
                <button
                  type="button"
                  onClick={() => set("familyFriends", !d.familyFriends)}
                  aria-pressed={d.familyFriends}
                  className={cn(
                    "w-full rounded-2xl p-6 text-left transition-all duration-500 md:p-8",
                    "bg-[#211d1b] text-[#f7f5f1] shadow-[0_18px_40px_-18px_rgba(33,29,27,0.45)]",
                    d.familyFriends ? "ring-2 ring-[#e8dfcd] ring-offset-4 ring-offset-[#f7f5f1]" : "opacity-95 hover:opacity-100",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/12">
                      <Users className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="text-[0.625rem] font-bold uppercase tracking-[0.3em] text-[#f7f5f1]/75">Add-on · Zu jedem Abo</span>
                  </span>
                  <span className="mt-6 block text-2xl font-medium tracking-tight md:text-3xl">Family &amp; Friends</span>
                  <span className="mt-3 block max-w-md text-base leading-relaxed font-light text-[#f7f5f1]/80">
                    Bringe jedes Mal bis zu {mockFamilyFriends.guests} Personen kostenlos mit ins Studio.
                  </span>
                  <span className="mt-8 flex items-end justify-between gap-6">
                    <span className="flex items-baseline gap-2">
                      <span className="text-5xl font-light tracking-tight">+{mockFamilyFriends.price}</span>
                      <span className="text-sm font-light text-[#f7f5f1]/75">€ / Monat</span>
                    </span>
                    <span className="text-[0.6875rem] font-bold uppercase tracking-[0.2em]">{d.familyFriends ? "Hinzugefügt ✓" : "Hinzufügen"}</span>
                  </span>
                </button>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Die beiden Begleitpersonen können Erwachsene und/oder Kinder sein. Sie dürfen das Studio nur gemeinsam mit dir nutzen. Als Mitglied haftest du für
                  Schäden, die durch deine Begleitung entstehen.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    set("familyFriends", false);
                    go(step + 1);
                  }}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-md bg-[#3b2a20] text-base text-[#f7f5f1] transition-colors hover:bg-[#3b2a20]/90"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} /> Kein Family &amp; Friends
                </button>
              </>
            )}

            {step === 6 && <SignaturePad value={d.signature} onChange={(v) => set("signature", v)} />}

            {step === 7 && (
              <>
                <dl className="divide-y divide-border border-y border-border text-base">
                  <div className="flex items-baseline justify-between gap-6 py-4">
                    <dt>
                      <span className="font-medium">{plan.name}</span> <span className="text-muted-foreground">· {plan.perWeek} pro Woche</span>
                    </dt>
                    <dd className="tabular-nums">{plan.price} € / Monat</dd>
                  </div>
                  {d.familyFriends && (
                    <div className="flex items-baseline justify-between gap-6 py-4">
                      <dt className="text-muted-foreground">Family &amp; Friends (bis zu {mockFamilyFriends.guests} Personen)</dt>
                      <dd className="tabular-nums">+{eur(mockFamilyFriends.price)} / Monat</dd>
                    </div>
                  )}
                  {d.familyFriends && (
                    <div className="flex items-baseline justify-between gap-6 py-4 font-medium">
                      <dt>Monatlich gesamt</dt>
                      <dd className="tabular-nums">{eur(Number(plan.price.replace(",", ".")) + mockFamilyFriends.price)}</dd>
                    </div>
                  )}
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
