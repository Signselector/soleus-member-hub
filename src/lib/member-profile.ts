import { useSyncExternalStore } from "react";
import { mockMember } from "@/lib/mock-data";

/** The signed-in member's editable profile. Mock: kept in localStorage until a backend exists. */
export type MemberProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  street: string;
  zip: string;
  city: string;
  state: string;
  hasHealthIssues: "yes" | "no";
  healthDetails: string;
  goals: string[];
  notifyEmail: boolean;
  notifySms: boolean;
};

const DEFAULTS: MemberProfile = {
  firstName: mockMember.firstName,
  lastName: mockMember.lastName,
  email: mockMember.email,
  phone: mockMember.phone,
  birthDate: "1990-05-14",
  street: "Musterstraße 12",
  zip: "1010",
  city: "Wien",
  state: "Wien",
  hasHealthIssues: "no",
  healthDetails: "",
  goals: ["Fitness steigern"],
  notifyEmail: true,
  notifySms: false,
};

const KEY = "soleus-member-profile";
let cache: MemberProfile | null = null;
const listeners = new Set<() => void>();

function read(): MemberProfile {
  if (cache) return cache;
  try {
    cache = { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<MemberProfile>) };
  } catch {
    cache = DEFAULTS;
  }
  return cache;
}

export function saveMemberProfile(patch: Partial<MemberProfile>) {
  cache = { ...read(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* storage unavailable: keep in memory */
  }
  listeners.forEach((l) => l());
}

export function useMemberProfile(): MemberProfile {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => DEFAULTS,
  );
}
