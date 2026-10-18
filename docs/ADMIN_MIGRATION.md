# Admin Portal: Rebuild & Migration

Status: erste Iteration (UI + Struktur auf Mock-Daten). Das alte Adminportal war nicht analysierbar (kein Zugriff auf Code, API oder Datenbank), alle Zahlen und Strukturen stammen aus Screenshots bzw. sind Mock.

## Umgesetzt
- Navigation: alle 16 bestehenden Module + 4 geplante (Zutritt, Probleme, Family & Friends, Gebühren & Gutschriften). Quelle: `src/lib/admin/modules.ts`.
- Dashboard, Buchungen (Filter, anlegen, ändern, stornieren, Status korrigieren), Kundenübersicht, Kundendetail (7 Bereiche), Abos, Stundenblock History.
- Alle weiteren Module: Platzhalterseite mit Migrationshinweis.
- Rolle `admin` (Mock, `auth-state.tsx`); `/admin` ist per `AdminGate` geschützt.

## NICHT umgesetzt / bewusst offen
- **Echte Autorisierung:** `AdminGate` ist nur Oberfläche. Es gibt noch kein Backend. Vor Livebetrieb: Rolle serverseitig prüfen (jede Admin-API, z. B. RLS / Server-Functions mit `role = 'admin'`), keine Admin-Daten an Nicht-Admins ausliefern.
- Activity Log, echte Daten, Backups, Embed, Zeitplan(V2), Stunden Anfragen, Trainer, Zusatzleistungen, Trainings Tagebuch, Support View, Admin Verwaltung.

## Vor dem Rebuild eines Moduls zu klären (aus altem System)
| Modul | Frage |
|---|---|
| Zeitplan / V2 | Unterschied? Ist V2 vollständiger Nachfolger? Beide bleiben bis dahin. |
| Stunden Anfragen | Businessregeln der Freigabe (pending/approved/rejected), Auswirkungen auf Kontingent. |
| Zusatzleistungen | Tabellen/Felder, Zuordnung Kunde ↔ Buchung. |
| Landingpage Embed | Was genau wird ausgeliefert/eingebettet? |
| Backups | Existiert ein Auslöser? Typ, Größe, Ablageort. |
| Trainings Tagebuch | Datenmodell und Funktionen. |
| Support View | Gibt es Funktionen über die Kundenansicht hinaus? |

## Migration (Reihenfolge)
old system → Export / Mapping → neue DB bzw. bestehendes Backend → Validierung → Cutover.

Kritisch, nichts darf verloren gehen: Kunden, Auth-Accounts, Abos, Stundenkontingente (inkl. History), Buchungen, **GoCardless Customer-/Mandate-/Subscription-IDs** (Mandate nie neu erstellen oder löschen), Trainer, Zeitplan, Logs.

Validierung je Entität: Zeilenanzahl alt = neu, Stichproben je Kunde (Abo, Stunden, GoCardless-IDs), Summenvergleich Stunden, keine verwaisten Buchungen.
