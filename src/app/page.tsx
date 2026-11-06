"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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

  const enter = () => {
    setLeaving(true);
    setTimeout(() => router.push("/calendar"), 650);
  };

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#fbf3e8] text-ink">
      {/* gradient glow */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #fdf8f1 0%, #fbeee0 45%, #f6d8c3 80%, #efc4b8 100%)" }}
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute left-1/2 top-[62%] h-[50vmax] w-[50vmax] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,190,120,.55), rgba(255,170,130,.15) 45%, transparent 65%)" }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
      />
      {stars.map((st, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[#e8a25c]"
          style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s }}
          animate={{ opacity: [0, 0.7, 0], y: [0, -40] }}
          transition={{ duration: 5 + st.d, repeat: Infinity, delay: st.d }}
        />
      ))}

      <AnimatePresence>
        {!leaving && (
          <motion.div
            key="content"
            className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
            exit={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <motion.p
              className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-ink/50"
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

            <motion.p
              className="mt-5 max-w-sm text-base text-ink/65"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 1 }}
            >
              Who&apos;s staying when, and everything you need for a lovely stay by the Danube.
            </motion.p>

            <Skyline className="mt-10 w-full max-w-xl" />

            <motion.button
              onClick={enter}
              className="group relative mt-10 inline-flex items-center gap-2 overflow-hidden rounded-full bg-ink px-7 py-3.5 font-semibold text-white shadow-[0_14px_40px_-12px_rgba(200,85,61,.7)]"
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
