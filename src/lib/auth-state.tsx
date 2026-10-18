import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type UserState = "guest" | "new" | "member";
export type BookingCase = "upcoming" | "none";
export type AccessCase = "pending" | "active";

type Ctx = {
  user: UserState;
  booking: BookingCase;
  access: AccessCase;
  setUser: (u: UserState) => void;
  setBooking: (b: BookingCase) => void;
  setAccess: (a: AccessCase) => void;
};

const AuthCtx = createContext<Ctx | null>(null);
const KEY = "soleus-mock-state";

export function AuthStateProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserState>("guest");
  const [booking, setBooking] = useState<BookingCase>("upcoming");
  const [access, setAccess] = useState<AccessCase>("pending");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.user) setUser(s.user);
        if (s.booking) setBooking(s.booking);
        if (s.access) setAccess(s.access);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ user, booking, access }));
  }, [user, booking, access]);

  return (
    <AuthCtx.Provider value={{ user, booking, access, setUser, setBooking, setAccess }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuthState() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuthState outside provider");
  return c;
}
