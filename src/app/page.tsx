"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Skyline from "@/components/Skyline";

const TITLE = "Jildi's Budapest Nest";

export default function Intro() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [stars, setStars] = useState<{ x: number; y: number; s: number; d: number }[]>([]);

  useEffect(() => {
    setStars(Array.from({ length: 28 }, () => ({ x: Math.random() * 100, y: 30 + Math.random() * 70, s: Math.random() * 4 + 2, d: Math.random() * 4 })));
    router.prefetch("/calendar");
  }, [router]);

  const words = useMemo(() => TITLE.split(" "), []);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 80, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 80, damping: 20 });

  const enter = () => {
    setLeaving(true);
    setTimeout(() => router.push("/calendar"), 650);
  };

  return (
    <main onPointerMove={(e) => { mx.set(e.clientX / window.innerWidth - 0.5); my.set(e.clientY / window.innerHeight - 0.5); }} style={{ perspective: 1000 }} className="fixed inset-0 overflow-hidden bg-[#f4f6fb] text-navy">
      {/* gradient glow */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #fbfcfe 0%, #eef2fa 40%, #dfe7f6 75%, #d3def3 100%)" }}
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute left-1/2 top-[62%] h-[50vmax] w-[50vmax] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(243,210,122,.45), rgba(46,86,166,.12) 45%, transparent 65%)" }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
      />
      {stars.map((st, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-navy-2/40"
          style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s }}
          animate={{ opacity: [0, 0.7, 0], y: [0, -40] }}
          transition={{ duration: 5 + st.d, repeat: Infinity, delay: st.d }}
        />
      ))}

      <AnimatePresence>
        {!leaving && (
          <motion.div
            key="content"
            style={{ rotateX: rx, rotateY: ry }}
            className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
            exit={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <motion.p
              className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-navy/50"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Szia · Welcome
            </motion.p>

            <h1 className="font-display text-5xl font-semibold leading-[1.05] sm:text-7xl">
              {words.map((w, wi) => (
                <span key={wi} className="inline-block whitespace-nowrap">
                  {w.split("").map((ch, ci) => (
                    <motion.span
                      key={ci}
                      className="inline-block"
                      initial={{ opacity: 0, y: 30, rotateX: -60 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ delay: 0.5 + (wi * 5 + ci) * 0.045, type: "spring", stiffness: 140, damping: 14 }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                  {wi < words.length - 1 && <span>&nbsp;</span>}
                </span>
              ))}
            </h1>
            <svg viewBox="0 0 300 20" className="mt-1 h-4 w-56 sm:w-72" aria-hidden>
              <motion.path
                d="M5 14 C 80 2, 180 2, 295 10"
                stroke="#c99a3e" strokeWidth={3} strokeLinecap="round" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
              />
            </svg>

            <motion.p
              className="mt-5 max-w-sm text-base text-navy/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 1 }}
            >
              Who&apos;s staying when, and everything you need for your stay.
            </motion.p>

            <Skyline className="mt-8 w-[calc(100%+3rem)] max-w-2xl sm:mt-10 sm:w-full" />

            <motion.button
              onClick={enter}
              className="group relative mt-10 inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-navy to-navy-2 px-7 py-3.5 font-semibold text-white shadow-[0_16px_40px_-12px_rgba(27,51,102,.7)]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4, type: "spring", stiffness: 120 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="relative z-10">Come on in</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
              <motion.span
                className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ["0%", "400%"] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, delay: 3 }}
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
