import { useEffect, useRef } from "react";
import { Eraser } from "lucide-react";

/** Finger / mouse signature field. Reports a PNG data URL (empty string when blank). */
export function SignaturePad({ value, onChange }: { value: string; onChange: (dataUrl: string) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const paint = (src: string) => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    if (!src) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height);
    img.src = src;
  };

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.clientWidth * ratio;
    c.height = c.clientHeight * ratio;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.lineWidth = 2.2 * ratio;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#211d1b";
    }
    paint(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };

  return (
    <div>
      <div className="relative rounded-xl border border-border bg-card">
        <canvas
          ref={canvas}
          className="block h-48 w-full touch-none rounded-xl md:h-56"
          aria-label="Unterschriftsfeld"
          onPointerDown={(e) => {
            const ctx = canvas.current?.getContext("2d");
            if (!ctx) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            drawing.current = true;
            const { x, y } = pos(e);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 0.01, y + 0.01);
            ctx.stroke();
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            const ctx = canvas.current?.getContext("2d");
            if (!ctx) return;
            const { x, y } = pos(e);
            ctx.lineTo(x, y);
            ctx.stroke();
          }}
          onPointerUp={() => {
            if (!drawing.current) return;
            drawing.current = false;
            onChange(canvas.current!.toDataURL("image/png"));
          }}
          onPointerCancel={() => {
            drawing.current = false;
          }}
        />
        {!value && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground/60">
            Hier unterschreiben
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          paint("");
          onChange("");
        }}
        className="eyebrow mt-4 inline-flex items-center gap-2 transition-colors hover:text-foreground"
      >
        <Eraser className="h-3.5 w-3.5" strokeWidth={1.5} /> Löschen
      </button>
    </div>
  );
}
