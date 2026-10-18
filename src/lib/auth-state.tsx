import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type UserState = "guest" | "new" | "member";
export type BookingCase = "upcoming" | "none";
export type AccessCase = "pending" | "active";

type Ctx = {
  user: UserState;
  booking: BookingCase;
  access: AccessCase;
  /** Timestamp (ms) of the sign-up, used for the 24h wait before the first trial booking. */
  registeredAt: number | null;
  setUser: (u: UserState) => void;
  setBooking: (b: BookingCase) => void;
  setAccess: (a: AccessCase) => void;
};

const AuthCtx = createContext<Ctx | null>(null);
const KEY = "soleus-mock-state";

export function AuthStateProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserState>("guest");
  const [registeredAt, setRegisteredAt] = useState<number | null>(null);
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
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ user, booking, access, registeredAt }));
  }, [user, booking, access, registeredAt]);

  const setUser = (u: UserState) => {
    if (u === "new") setRegisteredAt(Date.now());
    setUserState(u);
  };

  return (
    <AuthCtx.Provider value={{ user, booking, access, registeredAt, setUser, setBooking, setAccess }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuthState() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuthState outside provider");
  return c;
}
