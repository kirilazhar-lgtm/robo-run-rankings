import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type SignaturePadHandle = { clear: () => void; toDataURL: () => string; isEmpty: () => boolean };

// Native canvas signature pad: mouse + touch events, no library.
export const SignaturePad = forwardRef<SignaturePadHandle, { onChange?: (empty: boolean) => void }>(({ onChange }, ref) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const empty = useRef(true);

  const setup = () => {
    const c = canvas.current; if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const r = c.getBoundingClientRect();
    c.width = r.width * ratio; c.height = r.height * ratio;
    const ctx = c.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, r.width, r.height); // fond blanc pour l'image exportée
    ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#111827";
    empty.current = true; onChange?.(true);
  };

  useEffect(() => {
    setup();
    const c = canvas.current!;
    const pos = (x: number, y: number) => { const r = c.getBoundingClientRect(); return { x: x - r.left, y: y - r.top }; };
    const ctx = () => c.getContext("2d")!;
    const start = (x: number, y: number) => { drawing.current = true; const p = pos(x, y); ctx().beginPath(); ctx().moveTo(p.x, p.y); ctx().lineTo(p.x + 0.1, p.y + 0.1); ctx().stroke(); if (empty.current) { empty.current = false; onChange?.(false); } };
    const move = (x: number, y: number) => { if (!drawing.current) return; const p = pos(x, y); ctx().lineTo(p.x, p.y); ctx().stroke(); };
    const end = () => { drawing.current = false; };

    const md = (e: MouseEvent) => start(e.clientX, e.clientY);
    const mm = (e: MouseEvent) => move(e.clientX, e.clientY);
    const ts = (e: TouchEvent) => { e.preventDefault(); const t = e.touches[0]; if (t) start(t.clientX, t.clientY); };
    const tm = (e: TouchEvent) => { e.preventDefault(); const t = e.touches[0]; if (t) move(t.clientX, t.clientY); };
    c.addEventListener("mousedown", md); window.addEventListener("mousemove", mm); window.addEventListener("mouseup", end);
    c.addEventListener("touchstart", ts, { passive: false }); c.addEventListener("touchmove", tm, { passive: false }); c.addEventListener("touchend", end);
    return () => {
      c.removeEventListener("mousedown", md); window.removeEventListener("mousemove", mm); window.removeEventListener("mouseup", end);
      c.removeEventListener("touchstart", ts); c.removeEventListener("touchmove", tm); c.removeEventListener("touchend", end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    clear: setup,
    toDataURL: () => canvas.current!.toDataURL("image/png"),
    isEmpty: () => empty.current,
  }));

  return <canvas ref={canvas} className="h-48 w-full touch-none rounded-lg border-2 border-dashed border-input bg-card" aria-label="Zone de signature" />;
});
SignaturePad.displayName = "SignaturePad";
