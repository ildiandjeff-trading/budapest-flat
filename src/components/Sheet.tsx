"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

/** The part of the screen that's actually visible (shrinks when the phone keyboard opens). */
function useVisibleViewport(active: boolean) {
  const [vp, setVp] = useState<{ top: number; height: number } | null>(null);
  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!active || !vv) return;
    const update = () => setVp({ top: vv.offsetTop, height: vv.height });
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => { vv.removeEventListener("resize", update); vv.removeEventListener("scroll", update); };
  }, [active]);
  return active ? vp : null;
}

export default function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const { t } = useI18n();
  const panel = useRef<HTMLDivElement>(null);
  const vp = useVisibleViewport(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Always start at the top of the form.
    requestAnimationFrame(() => { if (panel.current) panel.current.scrollTop = 0; });
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  // Once the sheet has slid in: back to the top, and on computers (not phones, where it
  // would pop the keyboard and scroll the form) put the cursor in the first field.
  const settled = () => {
    const el = panel.current;
    if (!el) return;
    el.scrollTop = 0;
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      el.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });
    }
  };

  // When an input is focused and the keyboard opens, keep that input in view inside the sheet.
  const onFocus = (e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    if (!/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    setTimeout(() => target.scrollIntoView({ block: "nearest", behavior: "smooth" }), 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-x-0 z-50 flex items-end justify-center sm:items-center"
          style={vp ? { top: vp.top, height: vp.height } : { top: 0, bottom: 0 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal
            aria-label={title}
            onFocus={onFocus}
            className="relative max-h-[92%] w-full overflow-y-auto overscroll-contain rounded-t-3xl border border-line bg-elev p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6"
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            onAnimationComplete={(def) => { if (def && typeof def === "object" && "y" in def && def.y === 0) settled(); }}
          >
            {/* drag handle: swipe down here to close (not on the form, so scrolling the form works) */}
            <motion.div
              className="-mx-5 -mt-5 mb-1 flex cursor-grab touch-none justify-center px-5 pb-3 pt-3 sm:hidden"
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, i) => { if (i.offset.y > 80) onClose(); }}
            >
              <div className="h-1.5 w-10 rounded-full bg-line" />
            </motion.div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">{title}</h2>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-bg" aria-label={t("close")}><X className="h-5 w-5" /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
