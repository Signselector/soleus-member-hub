import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type UserState = "guest" | "new" | "member";
export type Role = "customer" | "admin";
export type BookingCase = "upcoming" | "none";
export type AccessCase = "pending" | "active";

type Ctx = {
  user: UserState;
  booking: BookingCase;
  access: AccessCase;
  /** Timestamp (ms) of the sign-up, used for the 24h wait before the first trial booking. */
  registeredAt: number | null;
  /** Role of the signed-in user. Mock only: real authorization must be enforced by the backend. */
  role: Role;
  /** False until the persisted state has been read, so guards do not flash "no access". */
  ready: boolean;
  setRole: (r: Role) => void;
  setUser: (u: UserState) => void;
  setBooking: (b: BookingCase) => void;
  setAccess: (a: AccessCase) => void;
};

const AuthCtx = createContext<Ctx | null>(null);
const KEY = "soleus-mock-state";

export function AuthStateProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserState>("guest");
  const [registeredAt, setRegisteredAt] = useState<number | null>(null);
  const [role, setRole] = useState<Role>("customer");
  const [ready, setReady] = useState(false);
  const [booking, setBooking] = useState<BookingCase>("upcoming");
  const [access, setAccess] = useState<AccessCase>("pending");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.user) setUserState(s.user);
        if (typeof s.registeredAt === "number") setRegisteredAt(s.registeredAt);
        if (s.booking) setBooking(s.booking);
        if (s.access) setAccess(s.access);
        if (s.role === "admin" || s.role === "customer") setRole(s.role);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify({ user, booking, access, registeredAt, role }));
  }, [ready, user, booking, access, registeredAt, role]);

  const setUser = (u: UserState) => {
    if (u === "new") setRegisteredAt(Date.now());
    setUserState(u);
  };

  return (
    <AuthCtx.Provider value={{ user, booking, access, registeredAt, role, ready, setRole, setUser, setBooking, setAccess }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuthState() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuthState outside provider");
  return c;
}
