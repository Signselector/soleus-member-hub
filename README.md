# Soleus Member Hub

PROJEKT: SOLEUS MEMBER PORTAL / APP.SOLEUS.AT – COMPLETE REBUILD

Wir bauen das bestehende Kundenportal von SOLEUS komplett neu.

WICHTIG:
Das derzeitige Portal unter app.soleus.at wird visuell NICHT als Referenz verwendet.
Wir sind mit dessen Design unzufrieden und wollen das Interface vollständig neu entwickeln.

Es dürfen KEINE visuellen Entscheidungen aus dem alten Portal übernommen werden:
- keine alten Cards
- keine alten Farben
- keine alten Kalender-Layouts
- keine alten Dashboard-Strukturen
- keine alten Abstände
- keine alten Komponenten
- keine alten UI-Patterns

Die einzige verbindliche visuelle Referenz ist:
https://soleus.at

Analysiere die bestehende Hauptwebsite sehr genau und übertrage deren Design-DNA auf das neue Member Portal.
Das Portal soll sich anfühlen, als wäre es von Anfang an gemeinsam mit soleus.at als EIN Produkt entwickelt worden.

1. PRODUKTVERSTÄNDNIS
SOLEUS ist ein Private Gym.
Das Member Portal wird später unter app.soleus.at laufen.
Die öffentliche Hauptwebsite soleus.at bleibt Marketing- und Informationswebsite.
app.soleus.at wird die operative Member Area für:
- Registrierung
- Login
- Probetraining
- Mitgliedschaften
- Buchungen
- Gym-Zutritt
- Abos
- Family & Friends
- Schadensmeldungen
- Accountverwaltung
- später weitere Member-Funktionen

Langfristig soll dieselbe Plattform außerdem als App im Apple App Store und Google Play Store veröffentlicht werden.
Deshalb muss die gesamte UI von Beginn an:
- responsive
- mobile-first
- touch-friendly
- app-artig
- modular
- für spätere native/wrapped App-Nutzung geeignet
entwickelt werden.

2. DESIGN-REFERENZ: SOLEUS.AT
Analysiere https://soleus.at selbstständig sehr genau.
Übernimm möglichst exakt dessen:
- Typografie, Schriftkombinationen, Font Weights, Größenverhältnisse
- Farbsystem: Warmer Off-White Sand-/Beige-Hintergrund (oklch(0.91 0.022 88) bzw. hsl(40 26% 96%)), tiefe warme Charcoal/Espresso-Textfarbe (oklch(0.235 0.008 55)), dezente warme Border (oklch(0.82 0.03 85)), Akzente und Muted-Töne
- Button-Stil: Dezente, edle Buttons mit feinem Tracking (tracking-[0.18em] / tracking-[0.2em]), Uppercase, dezenten Hover-Transitions
- Abstände, Section Spacing, Grid-Verhalten, minimalistische Trennlinien
- Visuelle Hierarchie, ruhiger Premium-Charakter
- Keine bunten SaaS-Dashboards, keine Neonfarben, keine generischen Kachelwüsten

3. DESIGNPRINZIP
Sehr reduziert, viel Weißraum, starke Typografie, großzügige Bereiche, klare Hierarchie.
Cards nur dort, wo sie wirklich sinnvoll sind. Editorial und hochwertig.

4. PHASE 1 – NUR DIESE SCREENS BAUEN
Baue in dieser ersten Phase ausschließlich:
A) AUTH / ENTRY
1. Login (E-Mail, Passwort, [ ANMELDEN ], Passwort vergessen, Registrieren-Link)
2. Registrierung (Vorname, Nachname, E-Mail, Telefon, Passwort, Passwort bestätigen, AGB-Checkbox)
3. Passwort vergessen
4. grundlegender Auth-State (Umschalten zwischen Gast, neuem User und bestehendem Member)

B) NEUER USER
Nach erfolgreicher Registrierung klarer Auswahl-Screen:
„Wie möchtest du SOLEUS kennenlernen?“
Option 1: KOSTENLOSES PROBETRAINING
Option 2: MITGLIED WERDEN
(User Flow und UI vorbereiten)

C) BESTEHENDER USER
Nach Login landet ein bestehendes Mitglied auf einem echten Member Dashboard / Home Screen:
- Dynamischer oberer Bereich:
  * Fall A (Kommende Buchung): Prominent "NÄCHSTE SESSION", Datum "Heute 18:00 — 19:00", "Private Gym", [ SESSION ANSEHEN ], sowie UI-Fläche für Zutritt ("Zutrittscode ab 17:30 verfügbar" bzw. aktiver Zutrittscode)
  * Fall B (Keine kommende Buchung): Prominent "Dein nächstes Training wartet." mit primärer Aktion [ TRAINING BUCHEN ]
- Weitere Home-Inhalte (stark reduziert, typografisch):
  * MITGLIEDSCHAFT (z.B. Standard · 49,90 €/Monat)
  * VERFÜGBARE EINHEITEN (z.B. 16 Stunden verfügbar)
  * NÄCHSTE BUCHUNGEN (maximal wenige relevante Einträge)
  * SCHNELLAKTIONEN (Training buchen, Meine Buchungen, Mitgliedschaft, Family & Friends, Problem melden)
- Switcher / Mock-State Selector, um schnell zwischen Fall A (aktive Session) und Fall B (keine Buchung) sowie neuer vs. bestehender User testen zu können.

5. NAVIGATION
- Desktop: Sehr reduzierte Navigation im Stil von soleus.at (Home, Buchen, Buchungen, Mitgliedschaft, Profil)
- Mobile: Reduzierte App-Navigation / Bottom Navigation passend zur Marke SOLEUS

6. TECHNISCHE GRUNDSTRUKTUR & MOCK DATA
- Saubere Komponentenstruktur (Layout, Navigation, Auth, Member Home, UI Components, Mock Data)
- Realistische Mock-Daten (Max Mustermann, Standard 49,90 €, 16 Stunden) sauber getrennt von Komponenten
- Zentrales Design-System mit Token-Konsistenz

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://soleus-member-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f944db63-2a0b-4795-bb51-3a559787086e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
