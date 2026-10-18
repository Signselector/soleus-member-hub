import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  SEED_CUSTOMERS,
  SEED_HOUR_CHANGES,
  seedBookings,
  type AdminBooking,
  type AdminCustomer,
  type BookingStatus,
  type HourChange,
  type HourKind,
  type PlanId,
} from "./mock";
import {
  SEED_ACTIVITY,
  SEED_ADDONS,
  SEED_ADMIN_USERS,
  SEED_INACTIVE,
  SEED_ROLES,
  SEED_AVAILABILITY,
  SEED_BACKUPS,
  SEED_DIARY,
  SEED_EXTENSIONS,
  SEED_REQUESTS,
  SEED_V2,
  type Activity,
  type AddonPurchase,
  type AddonStatus,
  type AdminRole,
  type AdminUser,
  type AppUser,
  type Backup,
  type BlockedDay,
  type DayPlan,
  type DiaryEntry,
  type Extension,
  type HourRequest,
  type RequestStatus,
  type V2Settings,
  type V2Slot,
} from "./mock2";

const ACTOR = "office@soleus.at";
const stamp = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export type NewCustomer = { firstName: string; lastName: string; email: string; phone: string; plan: PlanId };

type Store = {
  customers: AdminCustomer[];
  bookings: AdminBooking[];
  hourChanges: HourChange[];
  availability: DayPlan[];
  blocked: BlockedDay[];
  v2: Record<string, V2Slot>;
  v2Settings: V2Settings;
  extensions: Extension[];
  requests: HourRequest[];
  diary: DiaryEntry[];
  /** All users (customers + staff) with their roles. */
  users: AppUser[];
  /** Users with the trainer role. Trainers are managed via Admin Verwaltung. */
  trainers: AppUser[];
  /** Customer currently viewed in Support View, if any. */
  impersonating: string | null;
  backups: Backup[];
  activity: Activity[];
  addons: AddonPurchase[];

  addBooking: (b: Omit<AdminBooking, "id" | "session"> & { session?: [number, number] }) => void;
  updateBooking: (id: string, patch: Partial<Pick<AdminBooking, "start" | "type" | "status" | "durationMin">>) => void;
  setStatus: (id: string, status: BookingStatus) => void;
  deleteBooking: (id: string) => void;
  adjustHours: (customerId: string, delta: number, reason: string, actor?: string, kind?: HourKind) => void;

  createCustomer: (c: NewCustomer) => void;
  deleteCustomer: (id: string) => void;
  /** "+ Block": adds coaching units and sets package label / validity. */
  addBlock: (customerId: string, hours: number, validUntil: string, label: string) => void;
  /** "+ PG": adds Private Gym units. */
  addPG: (customerId: string, units: number, validUntil: string) => void;
  setNextDebit: (customerId: string, date: string) => void;
  setAddonStatus: (id: string, status: AddonStatus) => void;

  setDay: (day: number, patch: Partial<DayPlan>) => void;
  addBlocked: (date: string, reason: string) => void;
  removeBlocked: (id: string) => void;
  addV2: (keys: string[], slot: V2Slot) => void;
  removeV2: (keys: string[]) => void;
  setV2Settings: (patch: Partial<V2Settings>) => void;
  deleteBookings: (ids: string[]) => void;
  extendBlock: (customerId: string, weeks: number) => void;
  removeExtension: (id: string) => void;
  decideRequest: (id: string, status: Exclude<RequestStatus, "pending">) => void;
  addDiary: (e: Omit<DiaryEntry, "id">) => void;
  removeDiary: (id: string) => void;
  grantRole: (id: string, role: AdminRole) => void;
  revokeRole: (id: string, role: AdminRole) => void;
  addAdminUser: (u: { name: string; email: string; phone: string; roles: AdminRole[] }) => void;
  deleteUser: (id: string) => void;
  toggleUserActive: (id: string) => void;
  startImpersonation: (customerId: string) => void;
  endImpersonation: () => void;
  runBackup: () => void;
  restoreBackup: (id: string) => void;
};

const Ctx = createContext<Store | null>(null);

/** In-memory admin data. Every change is also written to the activity log; history entries are never overwritten. */
export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<AdminCustomer[]>(SEED_CUSTOMERS);
  const [bookings, setBookings] = useState<AdminBooking[]>(() => seedBookings(new Date()));
  const [hourChanges, setHourChanges] = useState<HourChange[]>(() => SEED_HOUR_CHANGES(new Date()));
  const [availability, setAvailability] = useState<DayPlan[]>(SEED_AVAILABILITY);
  const [blocked, setBlocked] = useState<BlockedDay[]>([]);
  const [v2, setV2State] = useState<Record<string, V2Slot>>(() => SEED_V2(new Date()));
  const [v2Settings, setV2SettingsState] = useState<V2Settings>({ defaultCoach: false });
  const [extensions, setExtensions] = useState<Extension[]>(() => SEED_EXTENSIONS(new Date()));
  const [requests, setRequests] = useState<HourRequest[]>(() => SEED_REQUESTS(new Date()));
  const [diary, setDiary] = useState<DiaryEntry[]>(() => SEED_DIARY(new Date()));
  const [staff, setStaff] = useState<AdminUser[]>(SEED_ADMIN_USERS);
  const [roles, setRoles] = useState<Record<string, AdminRole[]>>(SEED_ROLES);
  const [inactive, setInactive] = useState<string[]>(SEED_INACTIVE);
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [backups, setBackups] = useState<Backup[]>(() => SEED_BACKUPS(new Date()));
  const [activity, setActivity] = useState<Activity[]>(() => SEED_ACTIVITY(new Date()));
  const [addons, setAddons] = useState<AddonPurchase[]>(() => SEED_ADDONS(new Date()));

  const store = useMemo<Store>(() => {
    const log = (action: string, entity: string, entityId: string, meta: string, extra: { subjectId?: string; pg?: { from: number; to: number } | null } = {}) =>
      setActivity((p) => [{ id: `a${Date.now()}${Math.random().toString(36).slice(2, 6)}`, at: `${stamp()}:${String(new Date().getSeconds()).padStart(2, "0")}`, actor: ACTOR, action, entity, entityId, meta, subjectId: extra.subjectId ?? null, pg: extra.pg ?? null }, ...p]);
    const users: AppUser[] = [
      ...customers.map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, email: c.email, phone: c.phone, since: c.since, roles: roles[c.id] ?? [], active: !inactive.includes(c.id), kind: "customer" as const })),
      ...staff.map((u) => ({ ...u, roles: roles[u.id] ?? [], active: !inactive.includes(u.id), kind: "staff" as const })),
    ];
    const pgChange = (customerId: string, delta: 1 | -1) => {
      const c = customers.find((x) => x.id === customerId);
      if (!c?.pg) return null;
      const to = Math.min(c.pg.total, Math.max(0, c.pg.units + delta));
      if (to === c.pg.units) return null;
      setCustomers((p) => p.map((x) => (x.id === customerId && x.pg ? { ...x, pg: { ...x.pg, units: to } } : x)));
      return { from: c.pg.units, to };
    };
    const fmtD = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
    const bookingMeta = (b: { start: string; type: string }) => `Datum: ${fmtD(b.start)} | Zeit: ${b.start.slice(11, 16)}:00 | Typ: ${b.type === "private_gym" ? "Private Gym" : b.type === "premium" ? "Premium Training" : "Standard Training"}`;
    const nameOf = (id: string) => {
      const c = customers.find((x) => x.id === id);
      return c ? `${c.firstName} ${c.lastName}` : id;
    };

    const adjust: Store["adjustHours"] = (customerId, delta, reason, actor = ACTOR, kind = "Anpassung") => {
      const c = customers.find((x) => x.id === customerId);
      if (!c || delta === 0) return;
      const to = Math.max(0, c.hours + delta);
      setCustomers((p) => p.map((x) => (x.id === customerId ? { ...x, hours: to, hoursTotal: Math.max(x.hoursTotal, to) } : x)));
      setHourChanges((p) => [{ id: `h${Date.now()}`, customerId, kind, from: c.hours, to, reason, at: stamp(), actor }, ...p]);
      log("hours.adjust", "Stundenblock", customerId, `${c.hours} h → ${to} h · ${reason}`);
    };

    return {
      customers, bookings, hourChanges, availability, blocked, v2, v2Settings, extensions, requests, diary, users, backups, activity, addons, impersonating,
      trainers: users.filter((u) => u.roles.includes("trainer")),

      addBooking: (b) => {
        setBookings((p) => [...p, { ...b, session: b.session ?? [1, 1], id: `b${Date.now()}` }]);
        const pg = b.type === "private_gym" ? pgChange(b.customerId, -1) : null;
        log("booking.create", "Buchung", b.customerId, bookingMeta(b), { subjectId: b.customerId, pg });
      },
      updateBooking: (id, patch) => {
        setBookings((p) => p.map((b) => (b.id === id ? { ...b, ...patch } : b)));
        log("booking.update", "Buchung", id, Object.keys(patch).join(", "));
      },
      setStatus: (id, status) => {
        const b = bookings.find((x) => x.id === id);
        setBookings((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
        const refund = b && status === "cancelled" && b.status !== "cancelled" && b.status !== "completed" && b.type === "private_gym" ? pgChange(b.customerId, 1) : null;
        log(status === "cancelled" ? "booking.cancel" : "booking.status", "Buchung", id, b ? bookingMeta(b) : `Status → ${status}`, b ? { subjectId: b.customerId, pg: refund } : {});
      },
      deleteBooking: (id) => {
        const b = bookings.find((x) => x.id === id);
        setBookings((p) => p.filter((x) => x.id !== id));
        const refund = b && b.status !== "cancelled" && b.status !== "completed" && b.type === "private_gym" ? pgChange(b.customerId, 1) : null;
        if (b) log("booking.delete", "Buchung", id, bookingMeta(b), { subjectId: b.customerId, pg: refund });
      },
      adjustHours: adjust,

      createCustomer: (c) => {
        const id = `c${Date.now()}`;
        const today = stamp().slice(0, 10);
        const nc: AdminCustomer = {
          id, ...c, planMonths: 12, family: false, status: "pending", hours: 0, hoursTotal: 0, since: today, startDate: today,
          block: null, blockPayment: null, pg: null, v2: true, nextDebit: null,
          form: { street: "", zip: "", city: "", state: "", birthDate: "", healthIssues: "", medication: "", goals: [] },
          gc: { customerId: null, mandateId: null, subscriptionId: null, mandate: "none", payment: "none" },
        };
        setCustomers((p) => [nc, ...p]);
        log("customer.create", "Kunde", id, `${c.firstName} ${c.lastName}`);
      },
      deleteCustomer: (id) => {
        const name = nameOf(id);
        setCustomers((p) => p.filter((x) => x.id !== id));
        setBookings((p) => p.filter((b) => b.customerId !== id));
        log("customer.delete", "Kunde", id, name);
      },
      addBlock: (customerId, hours, validUntil, label) => {
        if (hours <= 0) return;
        const c = customers.find((x) => x.id === customerId);
        if (!c) return;
        setCustomers((p) => p.map((x) => (x.id === customerId ? { ...x, hours: x.hours + hours, hoursTotal: x.hoursTotal + hours, block: { label, validUntil: validUntil || null } } : x)));
        setHourChanges((p) => [{ id: `h${Date.now()}`, customerId, kind: "Verlängerung", from: c.hours, to: c.hours + hours, reason: `Block hinzugefügt: ${label} (+${hours} h)`, at: stamp(), actor: ACTOR }, ...p]);
        log("block.add", "Stundenblock", customerId, `+${hours} h · ${label}`);
      },
      addPG: (customerId, units, validUntil) => {
        if (units <= 0) return;
        setCustomers((p) => p.map((x) => (x.id === customerId ? { ...x, pg: { units: (x.pg?.units ?? 0) + units, total: (x.pg?.total ?? 0) + units, validUntil: validUntil || null } } : x)));
        log("pg.add", "Private Gym", customerId, `+${units} Einheiten`);
      },
      setNextDebit: (customerId, date) => {
        setCustomers((p) => p.map((x) => (x.id === customerId ? { ...x, nextDebit: date } : x)));
        log("debit.move", "Abo", customerId, `Abbuchung verschoben auf ${date}`);
      },
      setAddonStatus: (id, status) => {
        setAddons((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
        log(`addon.${status}`, "Zusatzleistung", id, status);
      },

      setDay: (day, patch) => {
        setAvailability((p) => p.map((d, i) => (i === day ? { ...d, ...patch } : d)));
        log("schedule.update", "Zeitplan", String(day), JSON.stringify(patch));
      },
      addBlocked: (date, reason) => {
        setBlocked((p) => [...p, { id: `x${Date.now()}`, date, reason }].sort((a, b) => a.date.localeCompare(b.date)));
        log("schedule.block", "Zeitplan", date, reason || "Tag gesperrt");
      },
      removeBlocked: (id) => {
        const b = blocked.find((x) => x.id === id);
        setBlocked((p) => p.filter((x) => x.id !== id));
        if (b) log("schedule.unblock", "Zeitplan", b.date, "Sperre entfernt");
      },
      addV2: (keys, slot) => {
        setV2State((p) => ({ ...p, ...Object.fromEntries(keys.map((k) => [k, slot])) }));
        log("schedule.v2.add", "Zeitplan V2", keys[0] ?? "", `${keys.length} Slot(s)${slot.coach ? " mit Coach-Option" : ""}`);
      },
      removeV2: (keys) => {
        setV2State((p) => {
          const n = { ...p };
          keys.forEach((k) => delete n[k]);
          return n;
        });
        log("schedule.v2.remove", "Zeitplan V2", keys[0] ?? "", `${keys.length} Slot(s) gelöscht`);
      },
      setV2Settings: (patch) => setV2SettingsState((p) => ({ ...p, ...patch })),
      deleteBookings: (ids) => {
        setBookings((p) => p.filter((b) => !ids.includes(b.id)));
        log("booking.delete", "Buchung", ids[0] ?? "", `${ids.length} Buchung(en) gelöscht`);
      },
      extendBlock: (customerId, weeks) => {
        const c = customers.find((x) => x.id === customerId);
        if (!c || !c.block || weeks <= 0) return;
        const base = c.block.validUntil ? new Date(`${c.block.validUntil}T00:00:00`) : new Date();
        base.setDate(base.getDate() + weeks * 7);
        const until = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}`;
        setCustomers((p) => p.map((x) => (x.id === customerId && x.block ? { ...x, block: { ...x.block, validUntil: until } } : x)));
        setExtensions((p) => [{ id: `e${Date.now()}`, customerId, at: stamp(), weeks }, ...p]);
        log("block.extend", "Stundenblock", customerId, `+${weeks} Woche(n) → ${until}`);
      },
      removeExtension: (id) => {
        const e = extensions.find((x) => x.id === id);
        if (!e) return;
        setExtensions((p) => p.filter((x) => x.id !== id));
        setCustomers((p) =>
          p.map((x) => {
            if (x.id !== e.customerId || !x.block?.validUntil) return x;
            const d = new Date(`${x.block.validUntil}T00:00:00`);
            d.setDate(d.getDate() - e.weeks * 7);
            return { ...x, block: { ...x.block, validUntil: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` } };
          }),
        );
        log("block.extend.remove", "Stundenblock", e.customerId, `Verlängerung +${e.weeks} Woche(n) entfernt`);
      },
      decideRequest: (id, status) => {
        const r = requests.find((x) => x.id === id);
        if (!r || r.status !== "pending") return;
        setRequests((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
        log(`request.${status}`, "Stunden Anfrage", id, `${r.hours} h`);
        if (status === "approved") {
          setRequests((p) => p.map((x) => (x.id === id ? { ...x, status, decidedAt: stamp() } : x)));
          if (r.kind === "private_gym") {
            setCustomers((p) => p.map((x) => (x.id === r.customerId ? { ...x, pg: { units: (x.pg?.units ?? 0) + r.hours, total: (x.pg?.total ?? 0) + r.hours, validUntil: x.pg?.validUntil ?? null } } : x)));
          } else {
            adjust(r.customerId, r.hours, `Stundenpaket freigegeben (${r.pkg}, ${r.hours} h)`, ACTOR, "Verlängerung");
          }
        }
      },
      addDiary: (e) => {
        setDiary((p) => [{ ...e, id: `d${Date.now()}` }, ...p]);
        log("diary.create", "Trainings Tagebuch", e.customerId, e.title);
      },
      removeDiary: (id) => {
        setDiary((p) => p.filter((x) => x.id !== id));
        log("diary.delete", "Trainings Tagebuch", id, "Eintrag gelöscht");
      },
      grantRole: (id, role) => {
        const u = users.find((x) => x.id === id);
        if (!u || u.roles.includes(role)) return;
        setRoles((p) => ({ ...p, [id]: [...(p[id] ?? []), role] }));
        log("role.grant", "Admin Verwaltung", id, `${u.email}: ${role}`);
      },
      revokeRole: (id, role) => {
        const u = users.find((x) => x.id === id);
        if (!u || !u.roles.includes(role)) return;
        setRoles((p) => ({ ...p, [id]: (p[id] ?? []).filter((r) => r !== role) }));
        log("role.revoke", "Admin Verwaltung", id, `${u.email}: ${role}`);
      },
      addAdminUser: (u) => {
        const id = `u${Date.now()}`;
        setStaff((p) => [...p, { id, name: u.name, email: u.email, phone: u.phone, since: stamp().slice(0, 10) }]);
        setRoles((p) => ({ ...p, [id]: u.roles }));
        log("user.create", "Admin Verwaltung", id, `${u.email} (${u.roles.join(", ") || "Benutzer"})`);
      },
      deleteUser: (id) => {
        const u = users.find((x) => x.id === id);
        if (!u) return;
        if (u.kind === "customer") {
          setCustomers((p) => p.filter((x) => x.id !== id));
          setBookings((p) => p.filter((b) => b.customerId !== id));
        } else setStaff((p) => p.filter((x) => x.id !== id));
        setRoles((p) => {
          const n = { ...p };
          delete n[id];
          return n;
        });
        log("user.delete", "Admin Verwaltung", id, u.email);
      },
      toggleUserActive: (id) => {
        const u = users.find((x) => x.id === id);
        setInactive((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
        if (u) log("user.toggle", "Admin Verwaltung", id, `${u.email} ${u.active ? "deaktiviert" : "aktiviert"}`);
      },
      startImpersonation: (customerId) => {
        setImpersonating(customerId);
        log("impersonation.start", "Support View", customerId, "Kunden-Dashboard", { subjectId: customerId });
      },
      endImpersonation: () => {
        if (impersonating) log("impersonation.end", "Support View", impersonating, "Kunden-Dashboard", { subjectId: impersonating });
        setImpersonating(null);
      },
      runBackup: () => {
        setBackups((p) => [{ id: `bk${Date.now()}`, at: stamp(), kind: "manual", status: "ok", sizeMb: p[0]?.sizeMb ?? 50, tables: 24 }, ...p]);
        log("backup.manual", "Backups", "manual", "Manuelles Backup ausgelöst");
      },
      restoreBackup: (id) => {
        const bk = backups.find((x) => x.id === id);
        // Mock: no data is replaced. The real restore runs on the backend.
        if (bk) log("backup.restore", "Backups", id, `Wiederherstellung von ${bk.at} angefordert`);
      },
    };
  }, [customers, bookings, hourChanges, availability, blocked, v2, v2Settings, extensions, requests, diary, staff, roles, inactive, impersonating, backups, activity, addons]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useAdminStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdminStore outside AdminStoreProvider");
  return c;
}
