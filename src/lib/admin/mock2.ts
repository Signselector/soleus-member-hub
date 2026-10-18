/** Mock data for the remaining admin modules. Shapes follow the descriptions of the previous admin portal. */
import type { HourKind } from "./mock";

/** Weekly availability (Zeitplan V1). Index 0 = Montag. */
export type DayPlan = { enabled: boolean; from: string; to: string };
export const WEEKDAYS_LONG = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"] as const;
export const SEED_AVAILABILITY: DayPlan[] = [
  { enabled: true, from: "07:00", to: "21:00" },
  { enabled: true, from: "07:00", to: "21:00" },
  { enabled: true, from: "07:00", to: "21:00" },
  { enabled: true, from: "07:00", to: "21:00" },
  { enabled: true, from: "07:00", to: "20:00" },
  { enabled: true, from: "09:00", to: "15:00" },
  { enabled: false, from: "09:00", to: "13:00" },
];
export type BlockedDay = { id: string; date: string; reason: string };

/** Zeitplan V2: per weekday + hour, Private Gym and Coach option. */
export type V2Slot = { privateGym: boolean; coach: boolean };
export const V2_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] as const;
export const SEED_V2: Record<string, V2Slot> = (() => {
  const o: Record<string, V2Slot> = {};
  for (let d = 0; d < 7; d++) for (const h of V2_HOURS) o[`${d}-${h}`] = { privateGym: false, coach: false };
  return o;
})();

export type RequestStatus = "pending" | "approved" | "rejected";
export type HourRequest = { id: string; customerId: string; hours: number; status: RequestStatus; at: string; note: string };
export const SEED_REQUESTS = (today: Date): HourRequest[] => {
  const iso = (o: number) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + o);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  return [
    { id: "r1", customerId: "c2", hours: 10, status: "pending", at: iso(-1), note: "Würde gerne ein zusätzliches Stundenpaket buchen." },
    { id: "r2", customerId: "c4", hours: 5, status: "approved", at: iso(-9), note: "" },
    { id: "r3", customerId: "c5", hours: 10, status: "rejected", at: iso(-15), note: "Abo aktuell pausiert." },
  ];
};

export type DiaryEntry = { id: string; customerId: string; date: string; trainerId: string; title: string; notes: string; weightKg: number | null };
export const SEED_DIARY = (today: Date): DiaryEntry[] => {
  const iso = (o: number) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + o);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  return [
    { id: "d1", customerId: "c1", date: iso(-1), trainerId: "u2", title: "Oberkörper Kraft", notes: "Bankdrücken 3×8 mit 60 kg, Rudern 3×10. Technik sauber.", weightKg: 82.4 },
    { id: "d2", customerId: "c1", date: iso(-8), trainerId: "u2", title: "Unterkörper", notes: "Kniebeugen 4×6 mit 80 kg. Leichte Ermüdung im letzten Satz.", weightKg: 82.9 },
    { id: "d3", customerId: "c2", date: iso(-2), trainerId: "u3", title: "Mobility & Core", notes: "Hüftmobilisation, Plank-Varianten. Schulter schmerzfrei.", weightKg: 61.2 },
  ];
};

export type AdminRole = "super_admin" | "admin" | "support" | "trainer";
export const ROLE_LABEL: Record<AdminRole, string> = { super_admin: "Super-Admin", admin: "Admin", support: "Support", trainer: "Trainer" };
export type AdminUser = { id: string; name: string; email: string; phone: string; role: AdminRole; active: boolean };
export const SEED_ADMIN_USERS: AdminUser[] = [
  { id: "u1", name: "SOLEUS Office", email: "office@soleus.at", phone: "", role: "super_admin", active: true },
  { id: "u2", name: "Lukas Berger", email: "lukas.berger@soleus.at", phone: "+43 660 100 20 30", role: "trainer", active: true },
  { id: "u3", name: "Anna Steiner", email: "anna.steiner@soleus.at", phone: "+43 664 200 30 40", role: "trainer", active: true },
  { id: "u4", name: "Florian Koller", email: "florian.koller@soleus.at", phone: "+43 676 300 40 50", role: "trainer", active: false },
];

export type Backup = { id: string; at: string; kind: "daily" | "manual"; status: "ok" | "failed"; sizeMb: number; tables: number };
export const SEED_BACKUPS = (today: Date): Backup[] =>
  Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i, 3, 0);
    const at = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T03:00`;
    return { id: `bk${i}`, at, kind: "daily" as const, status: i === 17 ? ("failed" as const) : ("ok" as const), sizeMb: Math.round((42 + (35 - i) * 0.35) * 10) / 10, tables: 24 };
  });

export type Activity = { id: string; at: string; actor: string; action: string; entity: string; entityId: string; meta: string };
export const SEED_ACTIVITY = (today: Date): Activity[] => {
  const actions: [string, string, string][] = [
    ["booking.create", "Buchung", "Buchung erstellt"],
    ["booking.cancel", "Buchung", "Buchung storniert"],
    ["customer.update", "Kunde", "Kundendaten geändert"],
    ["hours.adjust", "Stundenblock", "Stunden angepasst"],
    ["admin.login", "Admin", "Admin Login"],
    ["plan.change", "Abo", "Abo geändert"],
  ];
  const actors = ["office@soleus.at", "lukas.berger@soleus.at", "System", "max.mustermann@example.at", "laura.huber@example.at"];
  const out: Activity[] = [];
  for (let i = 0; i < 70; i++) {
    const day = Math.floor((i * 1.29) % 90);
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - day, 7 + ((i * 5) % 14), (i * 13) % 60);
    const [code, entity, text] = actions[i % actions.length]!;
    out.push({
      id: `a${i}`,
      at: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      actor: actors[(i * 3) % actors.length]!,
      action: code,
      entity,
      entityId: `${entity === "Kunde" ? "c" : "b"}${(i % 7) + 1}`,
      meta: text,
    });
  }
  return out.sort((a, b) => b.at.localeCompare(a.at));
};

export type AddonStatus = "pending" | "approved" | "done" | "rejected";
export type AddonPurchase = { id: string; customerId: string; label: string; price: number; at: string; source: "Abo" | "Einzel"; status: AddonStatus };
export const SEED_ADDONS = (today: Date): AddonPurchase[] => {
  const y = today.getFullYear();
  return [
    { id: "z1", customerId: "c1", label: "Segmental Körperanalyse – 1x Messung", price: 59, at: `${y}-09-04T10:12`, source: "Abo", status: "done" },
    { id: "z2", customerId: "c2", label: "Trainingsplan inkl. Ernährungsempfehlung", price: 79, at: `${y}-08-21T09:47`, source: "Abo", status: "approved" },
    { id: "z3", customerId: "c3", label: "Segmental Körperanalyse – 5x Messung", price: 145, at: `${y}-06-12T14:30`, source: "Abo", status: "done" },
    { id: "z4", customerId: "c4", label: "Family & Friends (Monat)", price: 15, at: `${y}-10-01T08:05`, source: "Abo", status: "pending" },
    { id: "z8", customerId: "c7", label: "Trainingsplan inkl. Ernährungsempfehlung", price: 79, at: `${y}-05-28T11:57`, source: "Abo", status: "rejected" },
    { id: "z5", customerId: "c7", label: "Trainingsplan inkl. Ernährungsempfehlung", price: 79, at: `${y - 1}-11-18T16:20`, source: "Abo", status: "done" },
    { id: "z6", customerId: "c1", label: "Segmental Körperanalyse – 5x Messung", price: 145, at: `${y - 1}-05-07T13:05`, source: "Einzel", status: "done" },
    { id: "z7", customerId: "c2", label: "Segmental Körperanalyse – 1x Messung", price: 59, at: `${y - 1}-03-29T09:15`, source: "Einzel", status: "done" },
  ];
};

export type { HourKind };
