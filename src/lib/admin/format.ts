const pad = (n: number) => String(n).padStart(2, "0");

export const parseLocal = (iso: string) => new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
export const toLocalIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fmtDate = (iso: string) => parseLocal(iso).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric" });
export const fmtDateLong = (d: Date) => d.toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
export const fmtDayShort = (iso: string) => parseLocal(iso).toLocaleDateString("de-AT", { weekday: "short", day: "2-digit", month: "2-digit" });
export const fmtTime = (iso: string) => `${pad(parseLocal(iso).getHours())}:${pad(parseLocal(iso).getMinutes())}`;
export const fmtRange = (iso: string, minutes: number) => {
  const s = parseLocal(iso);
  const e = new Date(s.getTime() + minutes * 60000);
  return `${pad(s.getHours())}:${pad(s.getMinutes())} — ${pad(e.getHours())}:${pad(e.getMinutes())}`;
};
export const fmtEur = (n: number) => n.toLocaleString("de-AT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
export const fullName = (c: { firstName: string; lastName: string }) => `${c.firstName} ${c.lastName}`;
