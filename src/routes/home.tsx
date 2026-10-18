import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, KeyRound } from "lucide-react";
import { MemberShell } from "@/components/layout/MemberShell";
import { ButtonLink, Eyebrow } from "@/components/ui-soleus/primitives";
import { useAuthState } from "@/lib/auth-state";
import { mockMember, mockNextSession, mockUpcomingBookings } from "@/lib/mock-data";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — SOLEUS Member" },
      { name: "description", content: "Deine nächste Session, Mitgliedschaft und Buchungen auf einen Blick." },
      { property: "og:title", content: "Home — SOLEUS Member" },
      { property: "og:description", content: "Deine nächste Session, Mitgliedschaft und Buchungen auf einen Blick." },
    ],
  }),
  component: Home,
});

const quick = [
  { to: "/buchen", label: "Training buchen" },
  { to: "/buchungen", label: "Meine Buchungen" },
  { to: "/mitgliedschaft", label: "Mitgliedschaft" },
  { to: "/family", label: "Family & Friends" },
  { to: "/problem-melden", label: "Problem melden" },
] as const;

function Home() {
  const { booking, access } = useAuthState();
  const m = mockMember;

  return (
    <MemberShell>
      <p className="eyebrow animate-rise">Hallo, {m.firstName}</p>

      {booking === "upcoming" ? (
        <section className="mt-6 grid gap-10 animate-rise md:grid-cols-[1.4fr_1fr] md:gap-16">
          <div>
            <Eyebrow>Nächste Session</Eyebrow>
            <h1 className="mt-4 text-5xl leading-[1.05] font-light tracking-tight md:text-7xl">
              {mockNextSession.dateLabel}
              <br />
              <span className="text-muted-foreground">{mockNextSession.time}</span>
            </h1>
            <p className="mt-6 text-sm uppercase tracking-[0.2em]">{mockNextSession.location}</p>
            <ButtonLink to="/buchungen" className="mt-10 w-full sm:w-auto">Session ansehen</ButtonLink>
          </div>
          <div className="flex flex-col justify-between rounded-2xl bg-primary p-8 text-primary-foreground md:p-10">
            <div className="flex items-center justify-between">
              <Eyebrow className="text-primary-foreground/75">Zutritt</Eyebrow>
              <KeyRound className="h-4 w-4 text-primary-foreground/75" strokeWidth={1.25} />
            </div>
            {access === "active" ? (
              <div className="mt-10">
                <p className="text-4xl font-light tracking-[0.15em] tabular-nums md:text-5xl">{mockNextSession.accessCode}</p>
                <p className="mt-4 text-sm text-primary-foreground/80">Dein Zutrittscode ist aktiv. Gib ihn am Eingang ein.</p>
              </div>
            ) : (
              <div className="mt-10">
                <p className="text-4xl font-light tracking-[0.15em] text-primary-foreground/40">— — — — — —</p>
                <p className="mt-4 text-sm text-primary-foreground/80">
                  Zutrittscode ab {mockNextSession.accessAvailableFrom} verfügbar.
                </p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="mt-6 animate-rise">
          <h1 className="max-w-3xl text-5xl leading-[1.05] font-light tracking-tight md:text-7xl">
            Dein nächstes Training wartet.
          </h1>
          <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
            Du hast aktuell keine kommende Buchung. Wähle einen Zeitraum, der zu dir passt.
          </p>
          <ButtonLink to="/buchen" className="mt-10 w-full sm:w-auto">Training buchen</ButtonLink>
        </section>
      )}

      <section className="mt-20 grid border-t border-border sm:grid-cols-2 md:mt-28">
        <Link to="/mitgliedschaft" className="group border-b border-border py-8 sm:border-r sm:pr-10">
          <Eyebrow>Mitgliedschaft</Eyebrow>
          <p className="mt-4 text-2xl font-light md:text-3xl">
            {m.membership.name} <span className="text-muted-foreground">· {m.membership.price}/{m.membership.interval}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Verlängert sich am {m.membership.renewsOn}</p>
        </Link>
        <div className="border-b border-border py-8 sm:pl-10">
          <Eyebrow>Verfügbare Einheiten</Eyebrow>
          <p className="mt-4 text-2xl font-light md:text-3xl">
            {m.hoursAvailable} Stunden <span className="text-muted-foreground">verfügbar</span>
          </p>
          <div className="mt-4 h-px w-full bg-border">
            <div className="h-px bg-foreground" style={{ width: `${(m.hoursAvailable / m.hoursTotal) * 100}%` }} />
          </div>
        </div>
      </section>

      <section className="mt-20 grid gap-16 md:mt-28 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-baseline justify-between">
            <Eyebrow>Nächste Buchungen</Eyebrow>
            <Link to="/buchungen" className="eyebrow hover:text-foreground">Alle</Link>
          </div>
          <ul className="mt-6 border-t border-border">
            {(booking === "upcoming" ? mockUpcomingBookings : []).map((b) => (
              <li key={b.id} className="flex items-center justify-between border-b border-border py-5">
                <div>
                  <p className="text-sm">{b.dateLabel}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">{b.location}</p>
                </div>
                <p className="text-sm tabular-nums">{b.time}</p>
              </li>
            ))}
            {booking === "none" && (
              <li className="border-b border-border py-5 text-sm text-muted-foreground">Keine kommenden Buchungen.</li>
            )}
          </ul>
        </div>
        <div>
          <Eyebrow>Schnellaktionen</Eyebrow>
          <ul className="mt-6 border-t border-border">
            {quick.map((q) => (
              <li key={q.to}>
                <Link
                  to={q.to}
                  className="group flex min-h-14 items-center justify-between border-b border-border text-[0.6875rem] uppercase tracking-[0.2em] transition-colors hover:text-muted-foreground"
                >
                  {q.label}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.25} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </MemberShell>
  );
}
