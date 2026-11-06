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

// little windows that light up once the building is drawn
const windows = [
  [143, 90], [153, 90], [163, 90], [184, 80], [194, 80], [206, 80], [216, 80], [237, 90], [247, 90], [257, 90],
  [190, 66], [210, 66],
];

export default function Skyline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 440 130" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="sky" x1="0" x2="440" y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c99a3e" />
          <stop offset="0.35" stopColor="#1b3366" />
          <stop offset="1" stopColor="#2e56a6" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f3d27a" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#f3d27a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#f3d27a" stopOpacity="0" />
        </radialGradient>
        <clipPath id="above-river"><rect x="0" y="0" width="440" height="101" /></clipPath>
      </defs>

      {/* rising sun behind the dome */}
      <g clipPath="url(#above-river)">
        <motion.circle
          cx={200} r={46} fill="url(#sun)"
          initial={{ cy: 130, opacity: 0 }}
          animate={{ cy: 46, opacity: 1 }}
          transition={{ duration: 3.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </g>

      {/* birds */}
      {[0, 1].map((i) => (
        <motion.path
          key={`b${i}`}
          d="M0 0 q3 -3 6 0 q3 -3 6 0"
          stroke="#1b3366" strokeWidth={1} strokeLinecap="round" opacity={0.55}
          initial={{ x: -20, y: 30 + i * 8 }}
          animate={{ x: [ -20, 460 ], y: [30 + i * 8, 18 + i * 6, 26 + i * 8] }}
          transition={{ duration: 16 + i * 4, repeat: Infinity, delay: 2.5 + i * 3, ease: "linear" }}
        />
      ))}

      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="url(#sky)"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.2, delay: 0.3 + i * 0.18, ease: [0.65, 0, 0.35, 1] }}
        />
      ))}

      {windows.map(([x, y], i) => (
        <motion.rect
          key={`w${i}`} x={x} y={y} width={3} height={4} rx={0.6} fill="#c99a3e"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.6, 1] }}
          transition={{ delay: 2.6 + i * 0.09, duration: 1.2, repeat: Infinity, repeatType: "mirror", repeatDelay: 2 + (i % 4) }}
        />
      ))}

      {/* river */}
      {[0, 1, 2].map((i) => (
        <motion.path
          key={`r${i}`}
          d={`M0 ${106 + i * 5} Q55 ${103 + i * 5} 110 ${106 + i * 5} T220 ${106 + i * 5} T330 ${106 + i * 5} T440 ${106 + i * 5}`}
          stroke="#2e56a6"
          strokeOpacity={0.4 - i * 0.1}
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, x: [0, -8, 0] }}
          transition={{ pathLength: { duration: 2, delay: 1.2 + i * 0.2 }, x: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" } }}
        />
      ))}

      {/* a little boat drifting down the Danube */}
      <motion.g
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: [ -40, 470 ], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 22, repeat: Infinity, delay: 3, ease: "linear", times: [0, 0.05, 0.95, 1] }}
      >
        <motion.g animate={{ y: [0, -1, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M0 108 h18 l-3 4 h-12 z" fill="#1b3366" />
          <path d="M6 108 v-6 h6 v6" stroke="#1b3366" strokeWidth={1} />
          <rect x={7.5} y={103.5} width={1.6} height={1.6} fill="#c99a3e" />
          <rect x={10} y={103.5} width={1.6} height={1.6} fill="#c99a3e" />
        </motion.g>
      </motion.g>

      <motion.circle
        cx={200} cy={13} r={2.4} fill="#c99a3e"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0.5, 1], scale: [0, 1.4, 1] }}
        transition={{ delay: 2.4, duration: 1.6 }}
      />
    </svg>
  );
}
