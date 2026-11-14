"use client";
import { motion } from "framer-motion";

/** Fisherman's Bastion turrets over the Danube, under a crescent moon. */
export default function Logo({ className = "h-9 w-9" }: { className?: string }) {
  const draw = (delay: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { delay, duration: 0.7, ease: [0.65, 0, 0.35, 1] as const },
  });
  return (
    <motion.svg
      viewBox="0 0 40 40"
      className={`${className} shrink-0 drop-shadow-[0_4px_10px_rgba(27,51,102,0.35)]`}
      whileHover="hover"
      aria-hidden
    >
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2e56a6" />
          <stop offset="1" stopColor="#132650" />
        </linearGradient>
        <clipPath id="logo-clip"><rect width="40" height="40" rx="11" /></clipPath>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#logo-bg)" />
      <g clipPath="url(#logo-clip)">
        {/* crescent moon */}
        <motion.g variants={{ hover: { rotate: -18, scale: 1.12 } }} style={{ originX: "31px", originY: "9px" }} transition={{ type: "spring", stiffness: 300, damping: 12 }}>
          <path d="M33.2 6.2a3.6 3.6 0 1 0 0 5.6a2.9 2.9 0 1 1 0-5.6z" fill="#f3d27a" />
        </motion.g>
        <motion.circle cx="8" cy="8" r="0.8" fill="#fff" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2.6, repeat: Infinity }} />
        <motion.circle cx="14.5" cy="5" r="0.55" fill="#fff" animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 3.2, repeat: Infinity }} />

        {/* turrets */}
        <motion.g variants={{ hover: { y: -1.2 } }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
          <path d="M20 7.2 16.4 15h7.2z" fill="#c99a3e" />
          <path d="M11 12.6 8.6 18h4.8zM29 12.6 26.6 18h4.8z" fill="#c99a3e" />
          <motion.path {...draw(0.1)} fill="none" d="M20 7.2V4.6M11 12.6v-1.8M29 12.6v-1.8" stroke="#f3d27a" strokeWidth="1.3" strokeLinecap="round" />
          <motion.path {...draw(0.2)} fill="none" d="M17.1 15v12M22.9 15v12M9.2 18v9M12.8 18v9M27.2 18v9M30.8 18v9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          <motion.path {...draw(0.35)} fill="none" d="M19 26.5v-2.6a1 1 0 0 1 2 0v2.6M12.8 21.5h4.3M22.9 21.5h4.3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <motion.path {...draw(0.45)} fill="none" d="M12.8 27v-2.3a2.15 2.15 0 0 1 4.3 0V27M22.9 27v-2.3a2.15 2.15 0 0 1 4.3 0V27" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
          <motion.path {...draw(0.3)} fill="none" d="M6.5 27.2h27" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        </motion.g>

        {/* the Danube */}
        <motion.g animate={{ x: [0, -6] }} transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}>
          <path d="M0 31.2q1.5-1.3 3-0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0" stroke="#9db8ea" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M0 34.6q1.5-1.1 3-0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0t3 0" stroke="#9db8ea" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.5" />
        </motion.g>
      </g>
    </motion.svg>
  );
}
