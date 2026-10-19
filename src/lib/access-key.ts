import { useSyncExternalStore } from "react";

/** A generated access key is valid for exactly one hour from the moment it is generated. */
export const KEY_VALID_MS = 60 * 60 * 1000;

export type AccessKey = { code: string; generatedAt: number; /** Which session the key was created for. */ sessionId: string };

const KEY = "soleus-access-key";
let cache: AccessKey | null | undefined;
const listeners = new Set<() => void>();

function read(): AccessKey | null {
  if (cache !== undefined) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "null") as AccessKey | null;
  } catch {
    cache = null;
  }
  return cache;
}

/** Mock: the 4-digit code is generated locally. The real code will come from the lock API. */
export function generateAccessKey(sessionId: string): AccessKey {
  const code = String(Math.floor(1000 + Math.random() * 9000));
  const k: AccessKey = { code, generatedAt: Date.now(), sessionId };
  cache = k;
  try {
    localStorage.setItem(KEY, JSON.stringify(k));
  } catch {
    /* storage unavailable: keep in memory */
  }
  listeners.forEach((l) => l());
  return k;
}

export function useAccessKey(): AccessKey | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => null,
  );
}
