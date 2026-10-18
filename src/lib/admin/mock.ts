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
  note?: string;
};

export type PlanId = "standard" | "plus" | "premium" | "unlimited";
export type AccountStatus = "active" | "paused" | "cancelled" | "pending";
export type MandateStatus = "active" | "pending" | "failed" | "none";

export type AdminCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  plan: PlanId;
  status: AccountStatus;
  hours: number;
  hoursTotal: number;
  since: string;
  startDate: string;
  gc: { customerId: string | null; mandateId: string | null; subscriptionId: string | null; mandate: MandateStatus; payment: "paid" | "pending" | "failed" | "none" };
};

export type HourChange = {
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

export const SEED_CUSTOMERS: AdminCustomer[] = [
  { id: "c1", firstName: "Max", lastName: "Mustermann", email: "max.mustermann@example.at", phone: "+43 660 123 45 67", plan: "standard", status: "active", hours: 16, hoursTotal: 20, since: "2025-03-01", startDate: "2025-03-01", gc: gc(1) },
  { id: "c2", firstName: "Laura", lastName: "Huber", email: "laura.huber@example.at", phone: "+43 664 555 11 22", plan: "plus", status: "active", hours: 7, hoursTotal: 8, since: "2025-06-12", startDate: "2025-06-12", gc: gc(2) },
  { id: "c3", firstName: "Thomas", lastName: "Gruber", email: "t.gruber@example.at", phone: "+43 676 888 99 00", plan: "premium", status: "active", hours: 11, hoursTotal: 12, since: "2024-11-03", startDate: "2024-11-03", gc: gc(3) },
  { id: "c4", firstName: "Sabine", lastName: "Wieser", email: "sabine.wieser@example.at", phone: "+43 650 212 34 56", plan: "unlimited", status: "active", hours: 18, hoursTotal: 20, since: "2025-09-20", startDate: "2025-09-20", gc: gc(4) },
  { id: "c5", firstName: "Daniel", lastName: "Egger", email: "daniel.egger@example.at", phone: "+43 699 440 77 18", plan: "standard", status: "paused", hours: 4, hoursTotal: 4, since: "2025-01-15", startDate: "2025-01-15", gc: gc(5, "active", "pending") },
  { id: "c6", firstName: "Julia", lastName: "Pichler", email: "julia.pichler@example.at", phone: "+43 660 909 12 34", plan: "plus", status: "pending", hours: 0, hoursTotal: 8, since: "2026-10-17", startDate: "2026-10-17", gc: gc(6, "pending", "none") },
  { id: "c7", firstName: "Markus", lastName: "Kofler", email: "markus.kofler@example.at", phone: "+43 664 321 65 40", plan: "premium", status: "active", hours: 3, hoursTotal: 12, since: "2024-08-09", startDate: "2024-08-09", gc: gc(7, "failed", "failed") },
  { id: "c8", firstName: "Eva", lastName: "Moser", email: "eva.moser@example.at", phone: "+43 650 777 01 02", plan: "standard", status: "cancelled", hours: 0, hoursTotal: 4, since: "2024-05-30", startDate: "2024-05-30", gc: gc(8, "none") },
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
  return rows.map(([d, h, c, t, s], i) => ({ id: `b${i + 1}`, customerId: c, start: at(d, h), durationMin: 60, type: t, status: s }));
}

export const SEED_HOUR_CHANGES = (today: Date): HourChange[] => {
  const iso = (offset: number, hh: string) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${hh}`;
  };
  return [
    { id: "h1", customerId: "c1", from: 17, to: 16, reason: "Private Gym Buchung", at: iso(-1, "18:00"), actor: "System" },
    { id: "h2", customerId: "c2", from: 8, to: 7, reason: "Premium Training", at: iso(-2, "17:00"), actor: "System" },
    { id: "h3", customerId: "c7", from: 4, to: 3, reason: "Überziehung", at: iso(-1, "19:00"), actor: "System" },
    { id: "h4", customerId: "c3", from: 10, to: 11, reason: "Gutschrift Wartezeit", at: iso(-3, "09:30"), actor: "office@soleus.at" },
  ];
};

/** KPI figures taken from the previous dashboard (screenshot). */
export const SEED_KPIS = { totalBookings: 1000, privateGym: 408, premium: 414, standard: 178, customers: 111, thisWeek: 0, thisMonth: 0 };
