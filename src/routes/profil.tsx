import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { MemberShell } from "@/components/layout/MemberShell";
import { Button, Eyebrow } from "@/components/ui-soleus/primitives";
import { useAuthState } from "@/lib/auth-state";
import { austrianStates, mockGoals, mockMember } from "@/lib/mock-data";
import { saveMemberProfile, useMemberProfile, type MemberProfile } from "@/lib/member-profile";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil — SOLEUS" },
      { name: "description", content: "Deine persönlichen Daten ansehen und ändern." },
      { property: "og:title", content: "Profil — SOLEUS" },
      { property: "og:description", content: "Deine persönlichen Daten ansehen und ändern." },
    ],
  }),
  component: Page,
});

const inputBox =
  "mt-2 block h-12 w-full rounded-md border border-border bg-background px-4 text-base text-foreground focus:border-foreground focus:outline-none";

const fmtDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString("de-AT", { day: "2-digit", month: "long", year: "numeric" }) : "—");

/** One card with a read view and an edit form; saves only the keys in `keys`. */
function Section<K extends keyof MemberProfile>({
  title,
  keys,
  profile,
  view,
  edit,
  validate,
  tone = "card",
}: {
  tone?: "card" | "sand";
  title: string;
  keys: K[];
  profile: MemberProfile;
  view: ReactNode;
  edit: (d: Pick<MemberProfile, K>, set: <P extends K>(k: P, v: MemberProfile[P]) => void) => ReactNode;
  validate?: (d: Pick<MemberProfile, K>) => string | null;
}) {
  const pick = () => Object.fromEntries(keys.map((k) => [k, profile[k]])) as Pick<MemberProfile, K>;
  const [editing, setEditing] = useState(false);
  const [d, setD] = useState<Pick<MemberProfile, K>>(pick);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const start = () => {
    setD(pick());
    setError(null);
    setSaved(false);
    setEditing(true);
  };
  const save = () => {
    const err = validate?.(d) ?? null;
    if (err) return setError(err);
    saveMemberProfile(d);
    setEditing(false);
    setSaved(true);
  };

  return (
    <section className={cn("rounded-2xl p-6 shadow-[0_18px_40px_-26px_rgba(33,29,27,0.35)] md:p-8", tone === "sand" ? "bg-secondary" : "bg-card")}>
      <div className="flex items-center justify-between gap-4">
        <Eyebrow>{title}</Eyebrow>
        {!editing && (
          <button type="button" onClick={start} className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] underline underline-offset-4 hover:text-muted-foreground">
            Bearbeiten
          </button>
        )}
      </div>
      {editing ? (
        <div className="mt-6">
          <div className="grid gap-5 sm:grid-cols-2">{edit(d, (k, v) => setD((p) => ({ ...p, [k]: v })))}</div>
          {error && <p className="mt-5 text-sm text-destructive" role="alert">{error}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={save}>Speichern</Button>
            <Button variant="outline" onClick={() => setEditing(false)}>Abbrechen</Button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          {view}
          {saved && <p className="mt-5 text-xs text-muted-foreground">Gespeichert ✓</p>}
        </div>
      )}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[0.625rem] font-bold uppercase tracking-[0.25em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-base font-light">{children || "—"}</dd>
    </div>
  );
}
const Grid = ({ children }: { children: ReactNode }) => <dl className="grid gap-6 sm:grid-cols-2">{children}</dl>;

function Input({ label, id, ...p }: { label: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label htmlFor={id} className="flex flex-col justify-end">
      <span className="eyebrow">{label}</span>
      <input id={id} className={inputBox} {...p} />
    </label>
  );
}

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 border-b border-border py-4 text-left text-base font-light"
    >
      {children}
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-[#211d1b]" : "bg-border")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-[#f7f5f1] transition-all", checked ? "left-[1.375rem]" : "left-0.5")} />
      </span>
    </button>
  );
}

function PasswordSection() {
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [rep, setRep] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = () => {
    if (!cur) return setMsg({ ok: false, text: "Bitte gib dein aktuelles Passwort ein." });
    if (next.length < 8) return setMsg({ ok: false, text: "Das neue Passwort braucht mindestens 8 Zeichen." });
    if (next !== rep) return setMsg({ ok: false, text: "Die Passwörter stimmen nicht überein." });
    setCur(""); setNext(""); setRep(""); setOpen(false);
    setMsg({ ok: true, text: "Passwort geändert ✓ (Demo: wird mit dem Backend wirksam)" });
  };

  return (
    <section className="rounded-2xl bg-card p-6 shadow-[0_18px_40px_-26px_rgba(33,29,27,0.35)] md:p-8">
      <div className="flex items-center justify-between gap-4">
        <Eyebrow>Passwort</Eyebrow>
        {!open && (
          <button type="button" onClick={() => { setOpen(true); setMsg(null); }} className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] underline underline-offset-4 hover:text-muted-foreground">
            Ändern
          </button>
        )}
      </div>
      {open ? (
        <div className="mt-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <Input id="pw-cur" label="Aktuelles Passwort" type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} />
            <Input id="pw-new" label="Neues Passwort" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
            <Input id="pw-rep" label="Wiederholen" type="password" autoComplete="new-password" value={rep} onChange={(e) => setRep(e.target.value)} />
          </div>
          {msg && !msg.ok && <p className="mt-5 text-sm text-destructive" role="alert">{msg.text}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={submit}>Passwort speichern</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-base font-light text-muted-foreground">{msg?.ok ? msg.text : "••••••••••"}</p>
      )}
    </section>
  );
}

function Page() {
  const p = useMemberProfile();
  const { setUser } = useAuthState();
  const navigate = useNavigate();
  const m = mockMember;

  return (
    <MemberShell>
      <div className="max-w-3xl animate-rise">
        <Eyebrow>Account</Eyebrow>
        <h1 className="mt-4 text-4xl leading-[1.05] font-light tracking-tight md:text-6xl">Mein Profil.</h1>
        <p className="mt-4 text-base font-light text-muted-foreground">
          {p.firstName} {p.lastName} · Mitglied seit {m.memberSince} · {m.membership.name}
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:items-start">
        <Section
          title="Persönliche Daten"
          keys={["firstName", "lastName", "email", "phone", "birthDate"]}
          profile={p}
          validate={(d) =>
            !d.firstName.trim() || !d.lastName.trim()
              ? "Vor- und Nachname sind Pflichtfelder."
              : !/^\S+@\S+\.\S+$/.test(d.email)
                ? "Bitte gib eine gültige E-Mail-Adresse ein."
                : null
          }
          view={
            <Grid>
              <Row label="Vorname">{p.firstName}</Row>
              <Row label="Nachname">{p.lastName}</Row>
              <Row label="E-Mail">{p.email}</Row>
              <Row label="Telefon">{p.phone}</Row>
              <Row label="Geburtsdatum">{fmtDate(p.birthDate)}</Row>
            </Grid>
          }
          edit={(d, set) => (
            <>
              <Input id="fn" label="Vorname" autoComplete="given-name" value={d.firstName} onChange={(e) => set("firstName", e.target.value)} />
              <Input id="ln" label="Nachname" autoComplete="family-name" value={d.lastName} onChange={(e) => set("lastName", e.target.value)} />
              <Input id="em" label="E-Mail" type="email" autoComplete="email" value={d.email} onChange={(e) => set("email", e.target.value)} />
              <Input id="ph" label="Telefon" type="tel" autoComplete="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} />
              <Input id="bd" label="Geburtsdatum" type="date" autoComplete="bday" value={d.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
            </>
          )}
        />

        <Section
          title="Anschrift"
          tone="sand"
          keys={["street", "zip", "city", "state"]}
          profile={p}
          validate={(d) => (!d.street.trim() || !d.zip.trim() || !d.city.trim() ? "Bitte fülle Straße, PLZ und Stadt aus." : null)}
          view={
            <Grid>
              <Row label="Straße">{p.street}</Row>
              <Row label="PLZ">{p.zip}</Row>
              <Row label="Stadt">{p.city}</Row>
              <Row label="Bundesland">{p.state}</Row>
            </Grid>
          }
          edit={(d, set) => (
            <>
              <div className="sm:col-span-2"><Input id="st" label="Straße und Hausnummer" autoComplete="street-address" value={d.street} onChange={(e) => set("street", e.target.value)} /></div>
              <Input id="zip" label="PLZ" autoComplete="postal-code" inputMode="numeric" value={d.zip} onChange={(e) => set("zip", e.target.value)} />
              <Input id="city" label="Stadt" autoComplete="address-level2" value={d.city} onChange={(e) => set("city", e.target.value)} />
              <label className="block sm:col-span-2">
                <span className="eyebrow">Bundesland</span>
                <select className={inputBox} value={d.state} onChange={(e) => set("state", e.target.value)}>
                  {austrianStates.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </>
          )}
        />

        <Section
          title="Gesundheit & Ziele"
          keys={["hasHealthIssues", "healthDetails", "goals"]}
          profile={p}
          validate={(d) => (d.hasHealthIssues === "yes" && !d.healthDetails.trim() ? "Bitte beschreibe deine gesundheitlichen Einschränkungen kurz." : null)}
          view={
            <dl className="space-y-6">
              <Row label="Gesundheitliche Einschränkungen">{p.hasHealthIssues === "yes" ? `Ja — ${p.healthDetails}` : "Nein"}</Row>
              <Row label="Ziele">{p.goals.join(", ")}</Row>
            </dl>
          }
          edit={(d, set) => (
            <>
              <div className="sm:col-span-2">
                <span className="eyebrow">Gesundheitliche Einschränkungen</span>
                <div className="mt-2 flex gap-3">
                  {(["no", "yes"] as const).map((v) => (
                    <button key={v} type="button" onClick={() => set("hasHealthIssues", v)} className={cn("h-12 flex-1 rounded-md border text-sm", d.hasHealthIssues === v ? "border-[#211d1b] bg-[#211d1b] text-[#f7f5f1]" : "border-border bg-background")}>
                      {v === "yes" ? "Ja" : "Nein"}
                    </button>
                  ))}
                </div>
                {d.hasHealthIssues === "yes" && (
                  <textarea rows={3} className={cn(inputBox, "h-auto py-3")} value={d.healthDetails} onChange={(e) => set("healthDetails", e.target.value)} />
                )}
              </div>
              <div className="sm:col-span-2">
                <span className="eyebrow">Ziele</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {mockGoals.map((g) => {
                    const on = d.goals.includes(g);
                    return (
                      <button key={g} type="button" aria-pressed={on} onClick={() => set("goals", on ? d.goals.filter((x) => x !== g) : [...d.goals, g])} className={cn("rounded-full border px-4 py-2 text-sm", on ? "border-[#211d1b] bg-[#211d1b] text-[#f7f5f1]" : "border-border bg-background")}>
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        />

        <section className="rounded-2xl bg-secondary p-6 shadow-[0_18px_40px_-26px_rgba(33,29,27,0.35)] md:p-8">
          <Eyebrow>Benachrichtigungen</Eyebrow>
          <div className="mt-4">
            <Toggle checked={p.notifyEmail} onChange={(v) => saveMemberProfile({ notifyEmail: v })}>Buchungsbestätigungen per E-Mail</Toggle>
            <Toggle checked={p.notifySms} onChange={(v) => saveMemberProfile({ notifySms: v })}>Erinnerungen per SMS</Toggle>
          </div>
        </section>

        <PasswordSection />

        <section className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-[0_18px_40px_-26px_rgba(33,29,27,0.35)] md:p-8">
          <Eyebrow className="text-primary-foreground/75">Konto</Eyebrow>
          <div className="mt-6 [&_dt]:text-primary-foreground/70">
            <Grid>
              <Row label="Mitglied seit">{m.memberSince}</Row>
              <Row label="Abo">{m.membership.name} · {m.membership.price}/{m.membership.interval}</Row>
            </Grid>
          </div>
          <Button variant="sand" className="mt-8" onClick={() => { setUser("guest"); void navigate({ to: "/login" }); }}>Abmelden</Button>
        </section>
      </div>
    </MemberShell>
  );
}
