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
} from "./mock";
import {
  SEED_ACTIVITY,
  SEED_ADDONS,
  SEED_ADMIN_USERS,
  SEED_AVAILABILITY,
  SEED_BACKUPS,
  SEED_DIARY,
  SEED_REQUESTS,
  SEED_TRAINERS,
  SEED_V2,
  type Activity,
  type AddonPurchase,
  type AdminRole,
  type AdminUser,
  type Backup,
  type BlockedDay,
  type DayPlan,
  type DiaryEntry,
  type HourRequest,
  type RequestStatus,
  type Trainer,
  type V2Slot,
} from "./mock2";

const ACTOR = "office@soleus.at";
const stamp = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

type Store = {
  customers: AdminCustomer[];
  bookings: AdminBooking[];
  hourChanges: HourChange[];
  trainers: Trainer[];
  availability: DayPlan[];
  blocked: BlockedDay[];
  v2: Record<string, V2Slot>;
  requests: HourRequest[];
  diary: DiaryEntry[];
  adminUsers: AdminUser[];
  backups: Backup[];
  activity: Activity[];
  addons: AddonPurchase[];

  addBooking: (b: Omit<AdminBooking, "id">) => void;
  updateBooking: (id: string, patch: Partial<Pick<AdminBooking, "start" | "type" | "status" | "durationMin">>) => void;
  setStatus: (id: string, status: BookingStatus) => void;
  adjustHours: (customerId: string, delta: number, reason: string, actor?: string, kind?: HourKind) => void;

  saveTrainer: (t: Omit<Trainer, "id"> & { id?: string }) => void;
  toggleTrainer: (id: string) => void;
  setDay: (day: number, patch: Partial<DayPlan>) => void;
  addBlocked: (date: string, reason: string) => void;
  removeBlocked: (id: string) => void;
  setV2: (key: string, patch: Partial<V2Slot>) => void;
  decideRequest: (id: string, status: Exclude<RequestStatus, "pending">) => void;
  addDiary: (e: Omit<DiaryEntry, "id">) => void;
  removeDiary: (id: string) => void;
  setRole: (id: string, role: AdminRole) => void;
  runBackup: () => void;
};

const Ctx = createContext<Store | null>(null);

/** In-memory admin data. Every change is also written to the activity log; history entries are never overwritten. */
export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<AdminCustomer[]>(SEED_CUSTOMERS);
  const [bookings, setBookings] = useState<AdminBooking[]>(() => seedBookings(new Date()));
  const [hourChanges, setHourChanges] = useState<HourChange[]>(() => SEED_HOUR_CHANGES(new Date()));
  const [trainers, setTrainers] = useState<Trainer[]>(SEED_TRAINERS);
  const [availability, setAvailability] = useState<DayPlan[]>(SEED_AVAILABILITY);
  const [blocked, setBlocked] = useState<BlockedDay[]>([]);
  const [v2, setV2State] = useState<Record<string, V2Slot>>(SEED_V2);
  const [requests, setRequests] = useState<HourRequest[]>(() => SEED_REQUESTS(new Date()));
  const [diary, setDiary] = useState<DiaryEntry[]>(() => SEED_DIARY(new Date()));
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(SEED_ADMIN_USERS);
  const [backups, setBackups] = useState<Backup[]>(() => SEED_BACKUPS(new Date()));
  const [activity, setActivity] = useState<Activity[]>(() => SEED_ACTIVITY(new Date()));
  const [addons] = useState<AddonPurchase[]>(() => SEED_ADDONS(new Date()));

  const store = useMemo<Store>(() => {
    const log = (action: string, entity: string, entityId: string, meta: string) =>
      setActivity((p) => [{ id: `a${Date.now()}${Math.random().toString(36).slice(2, 6)}`, at: stamp(), actor: ACTOR, action, entity, entityId, meta }, ...p]);

    const adjust: Store["adjustHours"] = (customerId, delta, reason, actor = ACTOR, kind = "Anpassung") => {
      const c = customers.find((x) => x.id === customerId);
      if (!c || delta === 0) return;
      const to = Math.max(0, c.hours + delta);
      setCustomers((p) => p.map((x) => (x.id === customerId ? { ...x, hours: to } : x)));
      setHourChanges((p) => [{ id: `h${Date.now()}`, customerId, kind, from: c.hours, to, reason, at: stamp(), actor }, ...p]);
      log("hours.adjust", "Stundenblock", customerId, `${c.hours} h → ${to} h · ${reason}`);
    };

    return {
      customers, bookings, hourChanges, trainers, availability, blocked, v2, requests, diary, adminUsers, backups, activity, addons,

      addBooking: (b) => {
        setBookings((p) => [...p, { ...b, id: `b${Date.now()}` }]);
        log("booking.create", "Buchung", b.customerId, `${b.start} · ${b.type}`);
      },
      updateBooking: (id, patch) => {
        setBookings((p) => p.map((b) => (b.id === id ? { ...b, ...patch } : b)));
        log("booking.update", "Buchung", id, Object.keys(patch).join(", "));
      },
      setStatus: (id, status) => {
        setBookings((p) => p.map((b) => (b.id === id ? { ...b, status } : b)));
        log(status === "cancelled" ? "booking.cancel" : "booking.status", "Buchung", id, `Status → ${status}`);
      },
      adjustHours: adjust,

      saveTrainer: (t) => {
        if (t.id) {
          setTrainers((p) => p.map((x) => (x.id === t.id ? { ...x, ...t } as Trainer : x)));
          log("trainer.update", "Trainer", t.id, t.name);
        } else {
          const id = `t${Date.now()}`;
          setTrainers((p) => [...p, { ...t, id } as Trainer]);
          log("trainer.create", "Trainer", id, t.name);
        }
      },
      toggleTrainer: (id) => {
        const t = trainers.find((x) => x.id === id);
        setTrainers((p) => p.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
        if (t) log("trainer.toggle", "Trainer", id, `${t.name} ${t.active ? "deaktiviert" : "aktiviert"}`);
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
      setV2: (key, patch) => {
        setV2State((p) => ({ ...p, [key]: { ...p[key]!, ...patch } }));
        log("schedule.v2", "Zeitplan V2", key, JSON.stringify(patch));
      },
      decideRequest: (id, status) => {
        const r = requests.find((x) => x.id === id);
        if (!r || r.status !== "pending") return;
        setRequests((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
        log(`request.${status}`, "Stunden Anfrage", id, `${r.hours} h`);
        if (status === "approved") adjust(r.customerId, r.hours, `Stundenpaket freigegeben (${r.hours} h)`, ACTOR, "Verlängerung");
      },
      addDiary: (e) => {
        setDiary((p) => [{ ...e, id: `d${Date.now()}` }, ...p]);
        log("diary.create", "Trainings Tagebuch", e.customerId, e.title);
      },
      removeDiary: (id) => {
        setDiary((p) => p.filter((x) => x.id !== id));
        log("diary.delete", "Trainings Tagebuch", id, "Eintrag gelöscht");
      },
      setRole: (id, role) => {
        const u = adminUsers.find((x) => x.id === id);
        setAdminUsers((p) => p.map((x) => (x.id === id ? { ...x, role } : x)));
        if (u) log("role.change", "Admin Verwaltung", id, `${u.email}: ${u.role} → ${role}`);
      },
      runBackup: () => {
        setBackups((p) => [{ id: `bk${Date.now()}`, at: stamp(), kind: "manual", status: "ok", sizeMb: p[0]?.sizeMb ?? 50, tables: 24 }, ...p]);
        log("backup.manual", "Backups", "manual", "Manuelles Backup ausgelöst");
      },
    };
  }, [customers, bookings, hourChanges, trainers, availability, blocked, v2, requests, diary, adminUsers, backups, activity, addons]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useAdminStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdminStore outside AdminStoreProvider");
  return c;
}
