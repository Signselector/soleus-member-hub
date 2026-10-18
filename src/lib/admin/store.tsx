import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  SEED_CUSTOMERS,
  SEED_HOUR_CHANGES,
  seedBookings,
  type AdminBooking,
  type AdminCustomer,
  type BookingStatus,
  type HourChange,
} from "./mock";

type Store = {
  customers: AdminCustomer[];
  bookings: AdminBooking[];
  hourChanges: HourChange[];
  addBooking: (b: Omit<AdminBooking, "id">) => void;
  updateBooking: (id: string, patch: Partial<Pick<AdminBooking, "start" | "type" | "status" | "durationMin">>) => void;
  setStatus: (id: string, status: BookingStatus) => void;
  adjustHours: (customerId: string, delta: number, reason: string, actor: string) => void;
};

const Ctx = createContext<Store | null>(null);

/** In-memory admin data. History entries are appended, never overwritten. */
export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<AdminCustomer[]>(SEED_CUSTOMERS);
  const [bookings, setBookings] = useState<AdminBooking[]>(() => seedBookings(new Date()));
  const [hourChanges, setHourChanges] = useState<HourChange[]>(() => SEED_HOUR_CHANGES(new Date()));

  const store = useMemo<Store>(
    () => ({
      customers,
      bookings,
      hourChanges,
      addBooking: (b) => setBookings((p) => [...p, { ...b, id: `b${Date.now()}` }]),
      updateBooking: (id, patch) => setBookings((p) => p.map((b) => (b.id === id ? { ...b, ...patch } : b))),
      setStatus: (id, status) => setBookings((p) => p.map((b) => (b.id === id ? { ...b, status } : b))),
      adjustHours: (customerId, delta, reason, actor) => {
        const c = customers.find((x) => x.id === customerId);
        if (!c || delta === 0) return;
        const to = Math.max(0, c.hours + delta);
        setCustomers((p) => p.map((x) => (x.id === customerId ? { ...x, hours: to } : x)));
        setHourChanges((p) => [
          { id: `h${Date.now()}`, customerId, from: c.hours, to, reason, at: new Date().toISOString().slice(0, 16), actor },
          ...p,
        ]);
      },
    }),
    [customers, bookings, hourChanges],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useAdminStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdminStore outside AdminStoreProvider");
  return c;
}
