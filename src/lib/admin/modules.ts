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

  { slug: "buchungen", label: "Buchungen", group: "Management", description: "Alle Buchungen verwalten.", built: true },
  { slug: "kunden", label: "Kunden", group: "Management", description: "Kundenübersicht und Kundendetail.", built: true },
  { slug: "abos", label: "Abos", group: "Management", description: "Mitgliedschaften und ihre Kunden.", built: true },
  {
    slug: "zusatzleistungen",
    label: "Zusatzleistungen",
    group: "Management",
    description: "Zusatzleistungen anlegen, bearbeiten, deaktivieren und Kunden zuweisen.",
    migration: "Datenstruktur der bestehenden Zusatzleistungen zuerst analysieren (Preis, Aktiv-Status, Buchungsbezug).",
  },
  {
    slug: "trainer",
    label: "Trainer",
    group: "Management",
    description: "Trainer verwalten, Verfügbarkeiten pflegen und Premium-Trainings zuordnen.",
  },

  {
    slug: "zeitplan",
    label: "Zeitplan",
    group: "Planung",
    description: "Bisheriger Zeitplan der Trainingszeiten.",
    migration: "Bleibt vorerst erhalten. Erst Unterschied zu Zeitplan V2 analysieren, bevor einer archiviert wird.",
  },
  {
    slug: "zeitplan-v2",
    label: "Zeitplan V2",
    group: "Planung",
    description: "Neuere Version des Zeitplans.",
    migration: "Bleibt neben dem alten Zeitplan zugänglich, bis geklärt ist, ob V2 die vollständige Nachfolge ist.",
  },
  {
    slug: "stunden-anfragen",
    label: "Stunden Anfragen",
    group: "Planung",
    description: "Anfragen für Stundenkontingente prüfen: pending, approved, rejected.",
    migration: "Bestehende Businessregeln der Freigabe nicht ohne Prüfung ändern.",
  },
  {
    slug: "stundenblock-history",
    label: "Stundenblock History",
    group: "Planung",
    description: "Nachvollziehbare Historie aller Änderungen an Stundenkontingenten.",
    built: true,
  },

  {
    slug: "trainings-tagebuch",
    label: "Trainings Tagebuch",
    group: "Training",
    description: "Trainingsaufzeichnungen der Kunden.",
    migration: "Bestehende Daten und Möglichkeiten analysieren und in das neue UI überführen, keine neue Fitnesslogik.",
  },

  { slug: "admin-verwaltung", label: "Admin Verwaltung", group: "System", description: "Admin-User, Rollen und Account-Status." },
  { slug: "backups", label: "Backups", group: "System", description: "Letzte Backups, Status, Größe und Typ. Backup auslösen." },
  {
    slug: "landingpage-embed",
    label: "Landingpage Embed",
    group: "System",
    description: "Einbindung für die Landingpage.",
    migration: "Zuerst exakt analysieren, was die bestehende Funktion macht. Nicht neu interpretieren.",
  },
  { slug: "aktivitaetsprotokoll", label: "Aktivitätsprotokoll", group: "System", description: "Wer hat wann was geändert?" },
  { slug: "support-view", label: "Support View", group: "System", description: "Zustand eines Kunden nachvollziehen." },

  { slug: "zutritt", label: "Zutritt", group: "Demnächst", planned: true, description: "Lock API, aktive Codes, Zutrittslogs, Check-in, Check-out, Fehler." },
  { slug: "probleme", label: "Probleme", group: "Demnächst", planned: true, description: "Schadensmeldungen, Wartezeit, Überziehung, Zutrittsprobleme." },
  { slug: "family-friends", label: "Family & Friends", group: "Demnächst", planned: true, description: "Begleitpersonen, Zuordnungen und Nutzung." },
  { slug: "gebuehren", label: "Gebühren & Gutschriften", group: "Demnächst", planned: true, description: "No-Show-Gebühren, Overrun, Wartezeit-Gutschriften, manuelle Anpassungen." },
];

export const ADMIN_GROUPS = ["Übersicht", "Management", "Planung", "Training", "System", "Demnächst"] as const;

export const adminPath = (slug: string) => (slug ? `/admin/${slug}` : "/admin");
