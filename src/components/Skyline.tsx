"use client";
import { motion } from "framer-motion";

const paths = [
  // Parliament
  "M10 100 H120 V78 L126 70 L132 78 V72 H150 V64 L154 56 L158 64 V72 H176 V60 Q200 26 224 60 V72 H242 V64 L246 56 L250 64 V72 H268 V78 L274 70 L280 78 V100 H290",
  "M200 37 V14",
  "M186 60 Q200 40 214 60",
  "M140 100 V86 M160 100 V86 M240 100 V86 M260 100 V86",
  // Chain Bridge
  "M290 92 H432",
  "M312 100 V62 H324 V100 M372 100 V62 H384 V100",
  "M290 84 Q304 66 312 64 M324 64 Q348 96 372 64 M384 64 Q398 66 432 84",
];

export default function Skyline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 440 120" fill="none" className={className} aria-hidden>
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="url(#sky)"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.2, delay: 0.3 + i * 0.18, ease: [0.65, 0, 0.35, 1] }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <motion.path
          key={`w${i}`}
          d={`M0 ${106 + i * 5} Q55 ${103 + i * 5} 110 ${106 + i * 5} T220 ${106 + i * 5} T330 ${106 + i * 5} T440 ${106 + i * 5}`}
          stroke="#2b6cb0"
          strokeOpacity={0.35 - i * 0.1}
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, x: [0, -8, 0] }}
          transition={{ pathLength: { duration: 2, delay: 1.2 + i * 0.2 }, x: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" } }}
        />
      ))}
      <motion.circle
        cx={200} cy={13} r={2.2} fill="#c8553d"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0.6, 1], scale: 1 }}
        transition={{ delay: 2.4, duration: 1.6 }}
      />
      <defs>
        <linearGradient id="sky" x1="0" x2="440" y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#d4a24c" />
          <stop offset="0.55" stopColor="#c8553d" />
          <stop offset="1" stopColor="#2b6cb0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
