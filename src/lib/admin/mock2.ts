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

/** Zeitplan V2: Private Gym slots per date + hour, optionally with the coach option. Key: "YYYY-MM-DD|H". */
export type V2Slot = { coach: boolean };
export type V2Settings = { defaultCoach: boolean };
export const v2Key = (date: string, hour: number) => `${date}|${hour}`;
export const SEED_V2 = (today: Date): Record<string, V2Slot> => {
  const o: Record<string, V2Slot> = {};
  const iso = (off: number) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + off);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  for (let off = -2; off <= 5; off++) for (const h of [5, 6, 8, 12, 16]) o[v2Key(iso(off), h)] = { coach: (off + h) % 3 === 0 };
  return o;
};

export type RequestStatus = "pending" | "approved" | "rejected";
export type RequestKind = "coaching" | "private_gym";
export type HourRequest = {
  id: string;
  customerId: string;
  kind: RequestKind;
  pkg: string;
  hours: number;
  /** Validity of the package, e.g. "5 Wochen". */
  validity: string;
  hasProof: boolean;
  status: RequestStatus;
  at: string;
  decidedAt: string | null;
  note: string;
};
export const SEED_REQUESTS = (today: Date): HourRequest[] => {
  const iso = (o: number, hh = "12:00") => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + o);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${hh}`;
  };
  const cust = ["c1", "c2", "c3", "c4", "c7"];
  const pk = ["Premium", "Standard", "Standard+"];
  const done: HourRequest[] = Array.from({ length: 23 }, (_, i) => {
    const pg = i % 4 === 1;
    return {
      id: `r${i + 10}`,
      customerId: cust[i % cust.length]!,
      kind: pg ? ("private_gym" as const) : ("coaching" as const),
      pkg: pg ? "10er-Block" : pk[i % pk.length]!,
      hours: 10,
      validity: pg ? "12 Wochen" : "8 Wochen",
      hasProof: i % 6 !== 5,
      status: "approved" as const,
      at: iso(-3 - i * 5, "09:00"),
      decidedAt: iso(-2 - i * 5, `${String(8 + (i % 10)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`),
      note: "",
    };
  });
  return [{ id: "r1", customerId: "c2", kind: "coaching", pkg: "Standard", hours: 10, validity: "5 Wochen", hasProof: true, status: "pending", at: iso(-1, "20:29"), decidedAt: null, note: "" }, ...done];
};

/** Validity extension of a coaching block ("Laufzeit-Verlängerung"). */
export type Extension = { id: string; customerId: string; at: string; weeks: number };
export const SEED_EXTENSIONS = (today: Date): Extension[] => {
  const iso = (o: number, hh: string) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + o);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${hh}`;
  };
  return [
    { id: "e1", customerId: "c3", at: iso(-20, "06:52"), weeks: 1 },
    { id: "e2", customerId: "c2", at: iso(-60, "09:35"), weeks: 1 },
    { id: "e3", customerId: "c4", at: iso(-95, "11:21"), weeks: 2 },
    { id: "e4", customerId: "c1", at: iso(-150, "13:35"), weeks: 1 },
    { id: "e5", customerId: "c7", at: iso(-210, "08:23"), weeks: 1 },
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

/** Staff roles. Every user is a customer ("Benutzer") by default; staff roles are added on top. */
export type AdminRole = "super_admin" | "admin" | "trainer" | "logfile";
export const ROLE_LABEL: Record<AdminRole, string> = { super_admin: "Super-Admin", admin: "Admin", trainer: "Trainer", logfile: "Logfile" };
/** Roles a super-admin can toggle per user. */
export const TOGGLE_ROLES: Exclude<AdminRole, "super_admin">[] = ["admin", "trainer", "logfile"];
/** Staff-only identities (not in the customer list). */
export type AdminUser = { id: string; name: string; email: string; phone: string; since: string };
export const SEED_ADMIN_USERS: AdminUser[] = [
  { id: "u1", name: "SOLEUS Office", email: "office@soleus.at", phone: "", since: "2024-01-02" },
  { id: "u2", name: "Lukas Berger", email: "lukas.berger@soleus.at", phone: "+43 660 100 20 30", since: "2024-03-11" },
  { id: "u3", name: "Anna Steiner", email: "anna.steiner@soleus.at", phone: "+43 664 200 30 40", since: "2024-06-03" },
  { id: "u4", name: "Florian Koller", email: "florian.koller@soleus.at", phone: "+43 676 300 40 50", since: "2025-02-17" },
];
export const SEED_ROLES: Record<string, AdminRole[]> = {
  u1: ["super_admin", "admin"],
  u2: ["trainer"],
  u3: ["trainer"],
  u4: ["trainer"],
  c3: ["logfile"],
};
export const SEED_INACTIVE: string[] = ["u4"];
/** Unified user (customer or staff-only) as shown in Admin Verwaltung. */
export type AppUser = { id: string; name: string; email: string; phone: string; since: string; roles: AdminRole[]; active: boolean; kind: "customer" | "staff" };

export type Backup = { id: string; at: string; kind: "daily" | "manual"; status: "ok" | "failed"; sizeMb: number; tables: number };
export const SEED_BACKUPS = (today: Date): Backup[] =>
  Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i, 3, 0);
    const at = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T03:00`;
    return { id: `bk${i}`, at, kind: "daily" as const, status: i === 17 ? ("failed" as const) : ("ok" as const), sizeMb: Math.round((42 + (35 - i) * 0.35) * 10) / 10, tables: 24 };
  });

export type Activity = {
  id: string;
  /** Local time with seconds: YYYY-MM-DDTHH:mm:ss */
  at: string;
  /** Who triggered it (admin e-mail or "System"). */
  actor: string;
  /** Machine action code, e.g. "booking.create". */
  action: string;
  entity: string;
  entityId: string;
  /** Details line. */
  meta: string;
  /** Affected customer, if any. */
  subjectId?: string | null;
  /** Private-Gym balance change caused by the action. */
  pg?: { from: number; to: number } | null;
};

export const ACTION_LABEL: Record<string, { label: string; tone: "dark" | "red" | "line" }> = {
  "booking.create": { label: "Buchung erstellt", tone: "dark" },
  "booking.delete": { label: "Buchung gelöscht", tone: "red" },
  "booking.cancel": { label: "Buchung storniert", tone: "red" },
  "booking.update": { label: "Buchung geändert", tone: "dark" },
  "booking.status": { label: "Buchungsstatus geändert", tone: "dark" },
  "schedule.v2.add": { label: "Zeitfenster erstellt", tone: "dark" },
  "schedule.v2.remove": { label: "Zeitfenster gelöscht", tone: "red" },
  "impersonation.start": { label: "IMPERSONATION_START", tone: "line" },
  "impersonation.end": { label: "IMPERSONATION_END", tone: "line" },
  "debit.move": { label: "MEMBERSHIP_RESCHEDULED", tone: "line" },
  "hours.adjust": { label: "Stunden angepasst", tone: "dark" },
  "block.add": { label: "Block hinzugefügt", tone: "dark" },
  "pg.add": { label: "Private Gym hinzugefügt", tone: "dark" },
  "block.extend": { label: "Laufzeit verlängert", tone: "dark" },
  "customer.create": { label: "Kunde erstellt", tone: "dark" },
  "customer.delete": { label: "Kunde gelöscht", tone: "red" },
  "role.grant": { label: "Rolle zugewiesen", tone: "dark" },
  "role.revoke": { label: "Rolle entzogen", tone: "red" },
  "user.create": { label: "Benutzer erstellt", tone: "dark" },
  "user.delete": { label: "Benutzer gelöscht", tone: "red" },
  "backup.manual": { label: "Backup erstellt", tone: "dark" },
  "backup.restore": { label: "Backup wiederhergestellt", tone: "red" },
};

export const SEED_ACTIVITY = (today: Date): Activity[] => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const dmy = (d: Date) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  const out: Activity[] = [];
  const kinds = ["booking.create", "booking.create", "booking.delete", "schedule.v2.add", "impersonation.start", "impersonation.end", "debit.move", "booking.create", "schedule.v2.remove", "hours.adjust"];
  const cust = ["c1", "c2", "c3", "c4", "c7"];
  for (let i = 0; i < 70; i++) {
    const day = Math.floor((i * 1.29) % 90);
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - day, 7 + ((i * 5) % 14), (i * 13) % 60, (i * 17) % 60);
    const action = kinds[i % kinds.length]!;
    const subject = cust[i % cust.length]!;
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1 + (i % 12), 8 + (i % 12));
    const isBooking = action.startsWith("booking.") && action !== "booking.update";
    const before = 20 - (i % 15);
    out.push({
      id: `a${i}`,
      at: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
      actor: action.startsWith("impersonation") || action === "debit.move" || action === "schedule.v2.add" || action === "schedule.v2.remove" || action === "hours.adjust" ? "office@soleus.at" : "System",
      action,
      entity: action.split(".")[0]!,
      entityId: subject,
      meta: isBooking ? `Datum: ${dmy(target)} | Zeit: ${pad(target.getHours())}:00:00 | Typ: Private Gym` : action === "debit.move" ? "Abbuchung verschoben" : action.startsWith("schedule") ? `Datum: ${dmy(target)} | Zeit: ${pad(target.getHours())}:00:00` : action === "hours.adjust" ? "Manuelle Anpassung" : "Kunden-Dashboard",
      subjectId: subject,
      pg: isBooking ? (action === "booking.create" ? { from: before, to: before - 1 } : { from: before - 1, to: before }) : null,
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
