/** Mock admin data. Replace with the real backend; shapes mirror what the old admin portal exposes. */
export type BookingStatus = "booked" | "active" | "completed" | "cancelled" | "no_show" | "overrun";
export type TrainingType = "private_gym" | "premium" | "standard";

export const STATUS_LABEL: Record<BookingStatus, string> = {
  booked: "Gebucht",
  active: "Aktiv",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
  no_show: "No Show",
  overrun: "Überzogen",
};
export const TYPE_LABEL: Record<TrainingType, string> = {
  private_gym: "Private Gym",
  premium: "Premium Training",
  standard: "Standard Training",
};

export type AdminBooking = {
  id: string;
  customerId: string;
  /** ISO start, local time */
  start: string;
  durationMin: number;
  type: TrainingType;
  status: BookingStatus;
  /** Position in a coaching block, e.g. [1, 1] → "(1/1)". */
  session: [number, number];
  /** Assigned trainer (admin user id), for Premium trainings. */
  trainerId?: string;
  note?: string;
};

export type PlanId = "standard" | "plus" | "premium" | "unlimited";
export type AccountStatus = "active" | "paused" | "cancelled" | "pending";
export type MandateStatus = "active" | "pending" | "failed" | "none";

/** Coaching package label and validity. Remaining units live in AdminCustomer.hours / hoursTotal. */
export type CoachingBlock = { label: string; validUntil: string | null };
export type CustomerForm = { street: string; zip: string; city: string; state: string; birthDate: string; healthIssues: string; medication: string; goals: string[] };

export type AdminCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  plan: PlanId;
  /** Contract duration in months. */
  planMonths: number;
  family: boolean;
  status: AccountStatus;
  hours: number;
  hoursTotal: number;
  since: string;
  startDate: string;
  block: CoachingBlock | null;
  blockPayment: { amount: number; status: "Ausgezahlt" | "Offen" } | null;
  pg: { units: number; total: number; validUntil: string | null } | null;
  v2: boolean;
  /** Next SEPA debit date (ISO date). */
  nextDebit: string | null;
  form: CustomerForm;
  gc: { customerId: string | null; mandateId: string | null; subscriptionId: string | null; mandate: MandateStatus; payment: "paid" | "pending" | "failed" | "none" };
};

export type HourKind = "Buchung" | "Anpassung" | "Verlängerung" | "Gutschrift";

export type HourChange = {
  kind: HourKind;
  id: string;
  customerId: string;
  from: number;
  to: number;
  reason: string;
  at: string;
  actor: string;
};

export const PLAN_INFO: Record<PlanId, { name: string; price: number; perWeek: string; hoursPerMonth: number }> = {
  standard: { name: "Standard", price: 49.9, perWeek: "1×", hoursPerMonth: 4 },
  plus: { name: "Plus", price: 74.9, perWeek: "2×", hoursPerMonth: 8 },
  premium: { name: "Premium", price: 89.9, perWeek: "3×", hoursPerMonth: 12 },
  unlimited: { name: "Unlimited", price: 109.9, perWeek: "∞", hoursPerMonth: 20 },
};

const gc = (n: number, m: MandateStatus = "active", pay: AdminCustomer["gc"]["payment"] = "paid"): AdminCustomer["gc"] =>
  m === "none"
    ? { customerId: null, mandateId: null, subscriptionId: null, mandate: "none", payment: "none" }
    : { customerId: `CU000${n}A1B2`, mandateId: `MD000${n}C3D4`, subscriptionId: `SB000${n}E5F6`, mandate: m, payment: pay };

const form = (street: string, zip: string, city: string, state: string, goals: string[] = ["Fitness steigern"]): CustomerForm => ({
  street, zip, city, state, birthDate: "1990-05-14", healthIssues: "Keine", medication: "Keine", goals,
});

export const SEED_CUSTOMERS: AdminCustomer[] = [
  { id: "c1", firstName: "Max", lastName: "Mustermann", email: "max.mustermann@example.at", phone: "+43 660 123 45 67", plan: "standard", planMonths: 12, family: false, status: "active", hours: 16, hoursTotal: 60, since: "2025-03-01", startDate: "2025-03-01", block: { label: "PT 1:1 Einzel", validUntil: "2027-03-01" }, blockPayment: { amount: 550, status: "Ausgezahlt" }, pg: { units: 6, total: 10, validUntil: "2027-01-31" }, v2: true, nextDebit: "2026-11-01", form: form("Magazingasse 11E", "9020", "Klagenfurt", "Kärnten", ["Muskelaufbau", "Fitness steigern"]), gc: gc(1) },
  { id: "c2", firstName: "Laura", lastName: "Huber", email: "laura.huber@example.at", phone: "+43 664 555 11 22", plan: "plus", planMonths: 12, family: true, status: "active", hours: 7, hoursTotal: 8, since: "2025-06-12", startDate: "2025-06-12", block: null, blockPayment: null, pg: null, v2: true, nextDebit: "2026-11-12", form: form("Bahnhofstraße 4", "9500", "Villach", "Kärnten", ["Nachhaltiges Abnehmen"]), gc: gc(2) },
  { id: "c3", firstName: "Thomas", lastName: "Gruber", email: "t.gruber@example.at", phone: "+43 676 888 99 00", plan: "premium", planMonths: 12, family: false, status: "active", hours: 11, hoursTotal: 12, since: "2024-11-03", startDate: "2024-11-03", block: { label: "PT 1:1 Einzel", validUntil: "2026-09-30" }, blockPayment: { amount: 145, status: "Ausgezahlt" }, pg: null, v2: true, nextDebit: "2026-11-03", form: form("Hauptplatz 9", "9020", "Klagenfurt", "Kärnten", ["Muskelaufbau"]), gc: gc(3) },
  { id: "c4", firstName: "Sabine", lastName: "Wieser", email: "sabine.wieser@example.at", phone: "+43 650 212 34 56", plan: "unlimited", planMonths: 12, family: true, status: "active", hours: 18, hoursTotal: 20, since: "2025-09-20", startDate: "2025-09-20", block: null, blockPayment: null, pg: { units: 2, total: 5, validUntil: "2026-12-15" }, v2: true, nextDebit: "2026-11-20", form: form("Seeweg 2", "9220", "Velden", "Kärnten"), gc: gc(4) },
  { id: "c5", firstName: "Daniel", lastName: "Egger", email: "daniel.egger@example.at", phone: "+43 699 440 77 18", plan: "standard", planMonths: 6, family: false, status: "paused", hours: 4, hoursTotal: 4, since: "2025-01-15", startDate: "2025-01-15", block: null, blockPayment: null, pg: null, v2: false, nextDebit: null, form: form("Ringstraße 7", "8010", "Graz", "Steiermark"), gc: gc(5, "active", "pending") },
  { id: "c6", firstName: "Julia", lastName: "Pichler", email: "julia.pichler@example.at", phone: "+43 660 909 12 34", plan: "plus", planMonths: 12, family: false, status: "pending", hours: 0, hoursTotal: 0, since: "2026-10-17", startDate: "2026-10-17", block: null, blockPayment: null, pg: null, v2: true, nextDebit: null, form: form("Lindengasse 3", "9020", "Klagenfurt", "Kärnten"), gc: gc(6, "pending", "none") },
  { id: "c7", firstName: "Markus", lastName: "Kofler", email: "markus.kofler@example.at", phone: "+43 664 321 65 40", plan: "premium", planMonths: 12, family: false, status: "active", hours: 3, hoursTotal: 12, since: "2024-08-09", startDate: "2024-08-09", block: null, blockPayment: { amount: 79, status: "Offen" }, pg: null, v2: true, nextDebit: "2026-10-25", form: form("Waldweg 15", "9061", "Wölfnitz", "Kärnten"), gc: gc(7, "failed", "failed") },
  { id: "c8", firstName: "Eva", lastName: "Moser", email: "eva.moser@example.at", phone: "+43 650 777 01 02", plan: "standard", planMonths: 12, family: false, status: "cancelled", hours: 0, hoursTotal: 0, since: "2024-05-30", startDate: "2024-05-30", block: null, blockPayment: null, pg: null, v2: false, nextDebit: null, form: form("Dorfstraße 1", "9100", "Völkermarkt", "Kärnten"), gc: gc(8, "none") },
];

/** Bookings are generated relative to today so the demo never goes stale. */
export function seedBookings(today: Date): AdminBooking[] {
  const at = (dayOffset: number, hour: number) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset, hour, 0, 0, 0);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00`;
  };
  const rows: [number, number, string, TrainingType, BookingStatus][] = [
    [0, 7, "c3", "private_gym", "completed"],
    [0, 12, "c2", "premium", "completed"],
    [0, 18, "c1", "private_gym", "booked"],
    [0, 19, "c4", "private_gym", "booked"],
    [0, 20, "c7", "standard", "booked"],
    [1, 7, "c1", "private_gym", "booked"],
    [1, 17, "c2", "premium", "booked"],
    [2, 18, "c3", "private_gym", "booked"],
    [4, 19, "c4", "private_gym", "booked"],
    [-1, 18, "c1", "private_gym", "completed"],
    [-1, 19, "c7", "private_gym", "overrun"],
    [-2, 17, "c2", "premium", "no_show"],
    [-3, 20, "c3", "standard", "completed"],
    [-4, 18, "c5", "private_gym", "cancelled"],
    [-6, 7, "c4", "private_gym", "completed"],
  ];
  return rows.map(([d, h, c, t, s], i) => ({
    id: `b${i + 1}`,
    customerId: c,
    start: at(d, h),
    durationMin: 60,
    type: t,
    status: s,
    session: [1, 1] as [number, number],
    ...(t === "premium" ? { trainerId: i % 2 ? "u3" : "u2" } : {}),
  }));
}

export const SEED_HOUR_CHANGES = (today: Date): HourChange[] => {
  const iso = (offset: number, hh: string) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${hh}`;
  };
  return [
    { id: "h1", customerId: "c1", from: 17, to: 16, reason: "Private Gym Buchung", kind: "Buchung", at: iso(-1, "18:00"), actor: "System" },
    { id: "h2", customerId: "c2", from: 8, to: 7, reason: "Premium Training", kind: "Buchung", at: iso(-2, "17:00"), actor: "System" },
    { id: "h3", customerId: "c7", from: 4, to: 3, reason: "Überziehung", kind: "Anpassung", at: iso(-1, "19:00"), actor: "System" },
    { id: "h4", customerId: "c3", from: 10, to: 11, reason: "Gutschrift Wartezeit", kind: "Gutschrift", at: iso(-3, "09:30"), actor: "office@soleus.at" },
  ];
};

/** KPI figures taken from the previous dashboard (screenshot). */
export const SEED_KPIS = { totalBookings: 1000, privateGym: 408, premium: 414, standard: 178, customers: 111, thisWeek: 0, thisMonth: 0 };
