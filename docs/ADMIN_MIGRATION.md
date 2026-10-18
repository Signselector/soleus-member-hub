# Admin Portal: Rebuild & Migration

Status: erste Iteration (UI + Struktur auf Mock-Daten). Das alte Adminportal war nicht analysierbar (kein Zugriff auf Code, API oder Datenbank), alle Zahlen und Strukturen stammen aus Screenshots bzw. sind Mock.

## Umgesetzt (Mock-Daten, Verhalten nach der Beschreibung des alten Portals)
- Buchungen, Kunden (+ Buchungshistorie), Abos (Coaching-Blöcke + Zahlungsstatus), Zusatzleistungen (Jahresfilter), Trainer (anlegen, bearbeiten, deaktivieren).
- Zeitplan (wöchentliche Verfügbarkeit, gesperrte Tage), Zeitplan V2 (Private Gym + Coach-Option; V1-Zeiten schreibgeschützt), Stunden Anfragen (freigeben/ablehnen → Verlängerung in der History), Stundenblock History.
- Trainings Tagebuch, Admin Verwaltung (Rollen: Super-Admin, Admin, Support, Trainer), Backups (35 Tage, manuell auslösbar), Landingpage Embed (Code = iframe der öffentlichen Buchungsseite wie auf soleus.at), Aktivitätsprotokoll (letzte 3 Monate, alle Aktionen im Admin werden protokolliert).
- Support View: Kunden-Dashboard ansehen (eigene Seite statt Popup), Kundenprobleme erkennen und beheben; Start/Ende werden als IMPERSONATION_START / IMPERSONATION_END protokolliert.
- Navigation enthält zusätzlich vorgesehene Module (Zutritt, Probleme, Family & Friends, Gebühren & Gutschriften).
- Rolle `admin` (Mock, `auth-state.tsx`); `/admin` ist per `AdminGate` geschützt.

## NICHT umgesetzt / bewusst offen
- **Echte Autorisierung:** `AdminGate` ist nur Oberfläche. Es gibt noch kein Backend. Vor Livebetrieb: Rolle serverseitig prüfen (jede Admin-API, z. B. RLS / Server-Functions mit `role = 'admin'`/`super_admin`), keine Admin-Daten an Nicht-Admins ausliefern.
- Alle Daten sind Mock (`src/lib/admin/mock*.ts`), nichts wird gespeichert. Backups und Zeitpläne sind nur Oberfläche.
- Annahme Zeitplan V2: "V1-Termine readonly" = Zeiten, die im V1-Zeitplan verfügbar sind, erscheinen in V2 gesperrt.

## Vor dem Rebuild eines Moduls zu klären (aus altem System)
| Modul | Frage |
|---|---|
| Zeitplan / V2 | Stimmt die Annahme zu "V1-Termine readonly"? Ist V2 vollständiger Nachfolger? Beide bleiben bis dahin. |
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

## Feldzuordnung aus den Screenshots des alten Portals (Mock, Annahmen)
- **Kunden:** Coaching = Paketname + Gültigkeit, Einheiten = Rest/Gesamt des Coaching-Blocks (`hours/hoursTotal`), Private Gym = Einheiten + Gültigkeit, Abo = Typ + Laufzeit in Monaten (+ Family), Gesamte Buchungen, Formular (Anmeldedaten), V2-Flag. Aktionen: `+ Block`, `+ PG`, ansehen, löschen.
- **Abos:** Coaching-Block (Rest/Gesamt), Zahlungen (Betrag + Ausgezahlt/Offen), aktiv seit, Preis/Monat (Abo + 15 € Family), SEPA-Mandat und Subscription (aus den GoCardless-IDs), Aktion „Abbuchung verschieben".
- **Zusatzleistungen:** Status Ausstehend → Genehmigt → Erledigt oder Abgelehnt; Umsatz = Genehmigt + Erledigt; Quelle (Abo/Einzel); Beleg noch ohne Funktion.
- **Trainer:** werden über Admin Verwaltung (Rolle Trainer) angelegt, nicht auf der Trainer-Seite. Monatsauswertung (Std/Termine), Verlauf, CSV-Report.
- **Buchungen:** Typ mit Position im Block, z. B. "Private Gym (1/1)"; Löschen mit Bestätigung. Offen: Bedeutung der kleinen Zahl vor dem Kundennamen.

## Zeitplan, Anfragen, History, Tagebuch (aus Screenshots, Annahmen)
- **Zeitplan / Zeitplan V2:** Tabs Kalenderansicht, Buchungen, Einstellungen. Wochenkalender (05:00–21:00) mit Trainer-Filter, Mehrfach löschen, Woche vor/zurück, Heute. V1-Slots ergeben sich aus der wöchentlichen Verfügbarkeit (Einstellungen), V2-Slots werden pro Datum/Stunde angelegt (optional mit Coach-Option, wiederholbar) und V1-Zeiten erscheinen dort schreibgeschützt. Fixtermine, Cardio-Kurs, Probetraining und Körperanalyse aus der Legende des alten Portals sind noch nicht als eigene Slot-Arten umgesetzt.
- **Stundenblock Anfragen:** Typ Coaching / Private Gym, Paket, Einheiten, Gültigkeit, Zahlungsnachweis (Datei folgt mit Backend), Freigeben/Ablehnen, "Kürzlich freigegeben" mit Paginierung. Freigabe Coaching → Einheiten + History-Eintrag, Private Gym → PG-Einheiten.
- **Stundenblock History:** KPIs (abgelaufene Blöcke, verfallene Stunden, Verlängerungen, Einträge), Tab Laufzeit-Verlängerungen (Quartal, +n Wochen, entfernen setzt das Ablaufdatum zurück) und Tab Verlauf (Stundenänderungen).
- **Trainings Tagebuch:** Kunde per Suche/Auswahl, erst danach Einträge.

## Benutzer, Backups, Embed, Protokoll, Support View (aus Screenshots, Annahmen)
- **Benutzerverwaltung (Super-Admin):** alle Benutzer (Kunden + Mitarbeiter) mit Mehrfach-Rollen Admin / Trainer / Logfile (plus Super-Admin). "Benutzer" = jeder Kunde. Der letzte Super-Admin kann nicht entfernt werden. Offen: Bedeutung der Rolle "Logfile" (angenommen: darf das Aktivitätsprotokoll sehen, serverseitig noch nicht erzwungen).
- **Backups:** Liste mit Dateiname (`YYYY-MM-DD_HH-mm.json`), Details, Restore mit Tipp-Bestätigung. Restore verändert in der Vorschau keine Daten.
- **Landingpage Embed:** Vorschau-Link, iframe-Code (inkl. Auto-Höhe-Skript), UTM-Tracking, Hinweise (Texte aus dem alten Portal).
- **Aktivitätsprotokoll:** Zeitpunkt mit Sekunden, Benutzer, Aktion (Label wie im alten Portal, z. B. IMPERSONATION_START), Details inkl. Private-Gym-Saldo (Buchung erstellt −1, gelöscht/storniert +1).
