/**
 * Single source of truth for the admin navigation. Every module of the previous admin portal is listed
 * here; modules without a screen yet render a placeholder page. `planned` modules are new and not built yet.
 */
export type AdminModule = {
  slug: string;
  label: string;
  group: "Übersicht" | "Management" | "Planung" | "Training" | "System" | "Demnächst";
  /** Short description shown on placeholder pages. */
  description: string;
  built?: boolean;
  planned?: boolean;
  /** Notes for the rebuild: what the old module did / what must be preserved. */
  migration?: string;
};

export const ADMIN_MODULES: AdminModule[] = [
  { slug: "", label: "Dashboard", group: "Übersicht", description: "Kennzahlen und Tagesübersicht.", built: true },

  { slug: "buchungen", label: "Buchungen", group: "Management", description: "Alle Kundenbuchungen anzeigen und verwalten.", built: true },
  { slug: "kunden", label: "Kunden", group: "Management", description: "Alle registrierten Kunden und ihre Buchungshistorie anzeigen.", built: true },
  { slug: "abos", label: "Abos", group: "Management", description: "Übersicht aller Abonnements mit Coaching-Blöcken und Zahlungsstatus.", built: true },
  {
    slug: "zusatzleistungen",
    label: "Zusatzleistungen",
    group: "Management",
    description: "Übersicht aller gebuchten Zusatzleistungen mit Jahresfilter.",
    built: true,
  },
  {
    slug: "trainer",
    label: "Trainer",
    group: "Management",
    description: "Alle Trainer anzeigen und verwalten.",
    built: true,
  },

  {
    slug: "zeitplan",
    label: "Zeitplan",
    group: "Planung",
    description: "Lege deine wöchentliche Verfügbarkeit fest und sperre bestimmte Tage.",
    built: true,
  },
  {
    slug: "zeitplan-v2",
    label: "Zeitplan V2",
    group: "Planung",
    description: "Private Gym & Coach-Option verwalten. V1-Termine werden schreibgeschützt angezeigt.",
    built: true,
  },
  {
    slug: "stunden-anfragen",
    label: "Stunden Anfragen",
    group: "Planung",
    description: "Kunden-Anfragen für neue Stundenpakete verwalten und freigeben.",
    built: true,
  },
  {
    slug: "stundenblock-history",
    label: "Stundenblock History",
    group: "Planung",
    description: "Verlauf aller Stundenblock-Änderungen und Verlängerungen.",
    built: true,
  },

  {
    slug: "trainings-tagebuch",
    label: "Trainings Tagebuch",
    group: "Training",
    description: "Trainingsfortschritte der Kunden verwalten.",
    built: true,
  },

  { slug: "admin-verwaltung", label: "Admin Verwaltung", group: "System", description: "Benutzerverwaltung (Super-Admin). Verwalte alle Rollen für Benutzer.", built: true },
  { slug: "backups", label: "Backups", group: "System", description: "Tägliche Snapshots aller Tabellen mit Schema und Daten. 35 Tage Aufbewahrung.", built: true },
  {
    slug: "landingpage-embed",
    label: "Landingpage Embed",
    group: "System",
    description: "Code zum Einbetten der öffentlichen Buchungsseite auf einer externen Landingpage.",
    built: true,
  },
  { slug: "aktivitaetsprotokoll", label: "Aktivitätsprotokoll", group: "System", description: "Letzte 3 Monate aller Benutzeraktivitäten.", built: true },
  { slug: "support-view", label: "Support View", group: "System", description: "Kunden-Dashboard ansehen, Kundenprobleme erkennen und beheben.", built: true },

  { slug: "zutritt", label: "Zutritt", group: "Demnächst", planned: true, description: "Lock API, aktive Codes, Zutrittslogs, Check-in, Check-out, Fehler." },
  { slug: "probleme", label: "Probleme", group: "Demnächst", planned: true, description: "Schadensmeldungen, Wartezeit, Überziehung, Zutrittsprobleme." },
  { slug: "family-friends", label: "Family & Friends", group: "Demnächst", planned: true, description: "Begleitpersonen, Zuordnungen und Nutzung." },
  { slug: "gebuehren", label: "Gebühren & Gutschriften", group: "Demnächst", planned: true, description: "No-Show-Gebühren, Overrun, Wartezeit-Gutschriften, manuelle Anpassungen." },
];

export const ADMIN_GROUPS = ["Übersicht", "Management", "Planung", "Training", "System", "Demnächst"] as const;

export const adminPath = (slug: string) => (slug ? `/admin/${slug}` : "/admin");
