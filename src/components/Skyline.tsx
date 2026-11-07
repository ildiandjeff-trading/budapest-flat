"use client";
import { motion, useReducedMotion } from "framer-motion";

/*
 * The intro skyline: the Hungarian Parliament and the Chain Bridge at sunset.
 * The outline draws itself in, the spires grow, the windows light up from the
 * dome outward, the bridge lamps come on one by one, a glint runs along the
 * chains, the yellow number 2 tram rolls along the embankment, boats pass and
 * the whole scene shimmers in the Danube below.
 */

const WATER = 126;
const EASE = [0.65, 0, 0.35, 1] as const;
const GOLD = "#c99a3e";
const mirrorX = (x: number, w = 0) => 310 - x - w; // the Parliament is symmetric around x = 155

// ── Parliament ──────────────────────────────────────────────────────────────
// one continuous silhouette, drawn left to right
const BODY =
  "M20 120 H30 V80 L41 58 L52 80 V92 H89 V84 L96 70 H112 L119 84 V92 H125 V80 L128 60 L131 80 H134 V62 H138 " +
  "C137 44 146 33 152 31 V24 L155 6 L158 24 V31 C164 33 173 44 172 62 " +
  "H176 V80 H179 L182 60 L185 80 V92 H191 V84 L198 70 H214 L221 84 V92 H258 V80 L269 58 L280 80 V120 H290";

const DETAILS = [
  // dome ribs, band and lantern
  "M146.5 62 C146.5 47 150 37 153.5 31.6 M163.5 62 C163.5 47 160 37 156.5 31.6",
  "M139 56 Q155 52 171 56",
  "M152 24 H158",
  // drum cornice and the cornices of the wings
  "M134 80 H176",
  "M52 94 H89 M221 94 H258 M119 94 H125 M185 94 H191",
  // roofs of the wings
  "M52 88 H89 M119 88 H125 M185 88 H191 M221 88 H258",
  // chamber roofs and pavilion dormers
  "M93 77 H115 M195 77 H217",
  "M38.5 74 V70 L41 67 L43.5 70 V74 M266.5 74 V70 L269 67 L271.5 70 V74",
  // the great central window
  "M146 106 V92 L155 84 L164 92 V106 M155 84 V106 M146 97 H164",
  // string course
  "M30 110 H280",
].join(" ");

// gothic arcade along the river front
const ARCADE = (() => {
  const out: string[] = [];
  for (let x = 32; x + 4 <= 278; x += 6) out.push(`M${x} 120 V115.5 L${x + 2} 112.5 L${x + 4} 115.5 V120`);
  return out.join(" ");
})();

// the forest of pinnacles: [x, base, tip]
const PIN_LEFT: [number, number, number][] = [
  [57, 92, 78], [63.5, 92, 78], [70.5, 92, 77], [77.5, 92, 78], [84, 92, 78],
  [89, 84, 64], [119, 84, 64], [122, 92, 80], [30, 80, 68], [52, 80, 68], [104, 70, 56], [134, 62, 50], [41, 58, 47],
];
const PINS = [...PIN_LEFT, ...PIN_LEFT.map(([x, b, t]) => [mirrorX(x), b, t] as [number, number, number])];
const pinPath = ([x, b, t]: [number, number, number]) => `M${x} ${b} V${t + 5} M${x - 1.6} ${t + 5.5} L${x} ${t} L${x + 1.6} ${t + 5.5}`;

// lit windows: [x, top, bottom]
const WIN_LEFT: [number, number, number][] = [
  ...[35, 39.5, 44].flatMap((x) => [[x, 84, 91], [x, 95, 107]] as [number, number, number][]),
  ...[57, 63, 69, 75, 81].map((x) => [x, 96, 108] as [number, number, number]),
  ...[93.5, 99.5, 105.5, 111.5].flatMap((x) => [[x, 87, 94], [x, 97, 108]] as [number, number, number][]),
  [120.5, 96, 108],
  [134.5, 86, 94], [134.5, 97, 106],
];
const WINDOWS: [number, number, number][] = [
  ...WIN_LEFT,
  ...WIN_LEFT.map(([x, t, b]) => [mirrorX(x, 3), t, b] as [number, number, number]),
  ...[137.5, 144, 150.5, 157, 163.5, 170].map((x) => [x, 66, 78] as [number, number, number]),
];
const winPath = ([x, t, b]: [number, number, number]) => `M${x} ${b} V${t + 2} L${x + 1.5} ${t} L${x + 3} ${t + 2} V${b} Z`;

// gold finials on the tips
const FINIALS: [number, number][] = [
  [41, 45.5], [269, 45.5], [128, 58.5], [182, 58.5], [96, 69], [214, 69],
];

// ── Chain Bridge ────────────────────────────────────────────────────────────
const PYLONS = [330, 410];
const DECK = 110;
const pylonPath = (c: number) =>
  [
    `M${c - 9} 130 V74 H${c + 9} V130`,
    `M${c - 10.5} 74 H${c + 10.5}`,
    `M${c - 7} 74 V69 H${c + 7} V74`,
    `M${c - 9} 84 H${c + 9}`,
    `M${c - 5} ${DECK} V93 A5 5 0 0 1 ${c + 5} 93 V${DECK}`,
    `M${c - 11} 130 H${c + 11}`,
  ].join(" ");
const BRIDGE = [pylonPath(PYLONS[0]), pylonPath(PYLONS[1]), "M290 130 V106 H300 V130"].join(" ");
const DECK_PATH =
  `M300 ${DECK} H321 M325 ${DECK} H335 M339 ${DECK} H401 M405 ${DECK} H415 M419 ${DECK} H440 ` +
  `M300 113.5 H321 M339 113.5 H401 M419 113.5 H440`;
const MAIN_CHAIN = "M339 79 Q370 130 401 79";
const CHAINS = [
  MAIN_CHAIN,
  "M339 83 Q370 128 401 83",
  "M321 79 Q308 100 300 106",
  "M419 79 Q432 96 440 101",
].join(" ");
// hangers from the main chain down to the deck
const HANGERS = (() => {
  const out: string[] = [];
  for (let x = 345; x <= 395; x += 5) {
    const t = (x - 339) / 62;
    const y = (1 - t) ** 2 * 79 + 2 * t * (1 - t) * 130 + t ** 2 * 79;
    out.push(`M${x} ${y.toFixed(1)} V${DECK}`);
  }
  return out.join(" ");
})();
const LAMPS = [295, 311, 347.5, 392.5, 429];
const lampBase = (x: number) => (x < 300 ? 106 : DECK);

// ── scenery ─────────────────────────────────────────────────────────────────
const RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  const r1 = 31, r2 = i % 2 ? 40 : 46;
  return `M${(155 + Math.cos(a) * r1).toFixed(1)} ${(50 + Math.sin(a) * r1).toFixed(1)} L${(155 + Math.cos(a) * r2).toFixed(1)} ${(50 + Math.sin(a) * r2).toFixed(1)}`;
}).join(" ");
const CLOUD = "M0 0 C0 -4 4 -6 7.5 -4 C9 -8.5 16 -9 18 -3.5 C22 -4.5 24.5 -1.5 23.5 0 Z";

export default function Skyline({ className = "" }: { className?: string }) {
  const still = useReducedMotion();
  const ink = { stroke: "url(#pl-ink)", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const draw = (delay: number, duration = 1.8) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration, delay, ease: EASE },
  });

  return (
    <svg viewBox="0 0 440 180" fill="none" className={className} role="img" aria-label="The Hungarian Parliament and the Chain Bridge on the Danube at sunset">
      <defs>
        <linearGradient id="pl-ink" x1="0" x2="440" y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c99a3e" />
          <stop offset="0.3" stopColor="#1b3366" />
          <stop offset="1" stopColor="#2e56a6" />
        </linearGradient>
        <linearGradient id="pl-facade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#eef3fb" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id="pl-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f3d27a" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#f3d27a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#f3d27a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pl-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f3d27a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#f3d27a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pl-fadegrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="pl-fade" maskUnits="userSpaceOnUse" x="0" y={WATER} width="440" height={180 - WATER}>
          <rect x="0" y={WATER} width="440" height={180 - WATER} fill="url(#pl-fadegrad)" />
        </mask>
        <filter id="pl-ripple" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="turbulence" baseFrequency="0.006 0.09" numOctaves={1} seed={4} result="noise">
            {!still && <animate attributeName="baseFrequency" dur="7s" values="0.006 0.09;0.008 0.12;0.006 0.09" repeatCount="indefinite" />}
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={2.5} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <clipPath id="pl-above"><rect x="0" y="0" width="440" height={WATER} /></clipPath>
      </defs>

      {/* setting sun with slowly turning rays, behind the dome */}
      <g clipPath="url(#pl-above)">
        <motion.g initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 3.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <circle cx={155} cy={50} r={56} fill="url(#pl-sun)" />
          <motion.path
            d={RAYS} stroke="#e2b85a" strokeWidth={1.2} strokeLinecap="round" strokeOpacity={0.35}
            animate={{ rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          />
        </motion.g>
      </g>

      {/* clouds drifting by */}
      {[{ x: 34, y: 26, s: 1, d: 34 }, { x: 330, y: 40, s: 0.75, d: 42 }].map((c, i) => (
        <motion.g
          key={`c${i}`}
          initial={{ x: c.x, opacity: 0 }}
          animate={{ x: [c.x, c.x + 28, c.x], opacity: 1 }}
          transition={{ x: { duration: c.d, ease: "easeInOut", repeat: Infinity }, opacity: { duration: 2, delay: 1 } }}
        >
          <path d={CLOUD} transform={`translate(0 ${c.y}) scale(${c.s})`} fill="#ffffff" fillOpacity={0.7} stroke="#2e56a6" strokeOpacity={0.35} strokeWidth={0.9} strokeLinejoin="round" />
        </motion.g>
      ))}

      {/* a small flock, wings flapping */}
      <motion.g
        initial={{ x: -30, y: 20 }}
        animate={{ x: [-30, 470], y: [20, 10, 18, 8] }}
        transition={{ duration: 20, repeat: Infinity, delay: 2.5, ease: "linear" }}
      >
        {[[0, 0], [14, -5], [11, 7]].map(([bx, by], i) => (
          <motion.path
            key={`b${i}`}
            stroke="#1b3366" strokeWidth={1} strokeLinecap="round" strokeOpacity={0.6}
            transform={`translate(${bx} ${by})`}
            initial={{ d: "M0 0 Q3 -3.5 6 0 Q9 -3.5 12 0" }}
            animate={{ d: ["M0 0 Q3 -3.5 6 0 Q9 -3.5 12 0", "M0 0 Q3 1.8 6 0 Q9 1.8 12 0"] }}
            transition={{ duration: 0.38, repeat: Infinity, repeatType: "mirror", delay: i * 0.12 }}
          />
        ))}
      </motion.g>

      {/* ── Parliament ── */}
      <motion.path
        id="pl-body" d={BODY} {...ink} strokeWidth={1.7} fill="url(#pl-facade)"
        initial={{ pathLength: 0, opacity: 0, fillOpacity: 0 }}
        animate={{ pathLength: 1, opacity: 1, fillOpacity: 1 }}
        transition={{ pathLength: { duration: 3, delay: 0.3, ease: EASE }, opacity: { duration: 0.4, delay: 0.3 }, fillOpacity: { duration: 1.6, delay: 1.6 } }}
      />
      <motion.path d="M20 120 H290" {...ink} strokeWidth={1.4} {...draw(0.25, 1.6)} />
      <motion.path d={DETAILS} {...ink} strokeWidth={1} {...draw(1.4, 2.2)} />
      <motion.path d={ARCADE} {...ink} strokeWidth={0.9} {...draw(1.1, 2.2)} />

      {/* spires grow from the centre outward */}
      {PINS.map((p, i) => (
        <motion.path
          key={`p${i}`} d={pinPath(p)} {...ink} strokeWidth={1.1}
          {...draw(1.3 + (Math.abs(p[0] - 155) / 125) * 1.1, 0.9)}
        />
      ))}

      {/* windows light up from the dome outward; a few keep flickering */}
      {WINDOWS.map((w, i) => {
        const delay = 2.5 + (Math.abs(w[0] - 155) / 125) * 1.3;
        const flicker = i % 5 === 0;
        return (
          <motion.path
            key={`w${i}`} d={winPath(w)} fill={GOLD}
            initial={{ opacity: 0 }}
            animate={{ opacity: flicker ? [0, 0.95, 0.45, 0.95] : 0.9 }}
            transition={flicker
              ? { delay, duration: 1.6, repeat: Infinity, repeatType: "mirror", repeatDelay: 1.5 + (i % 3) }
              : { delay, duration: 0.6 }}
          />
        );
      })}
      <motion.path
        d="M146.6 105.5 V92.3 L155 84.8 L163.4 92.3 V105.5 Z" fill={GOLD}
        initial={{ opacity: 0 }} animate={{ opacity: [0, 0.55, 0.35, 0.55] }}
        transition={{ delay: 2.4, duration: 2.4, repeat: Infinity, repeatType: "mirror" }}
      />
      {/* glow in the lantern and little round windows in the dome */}
      {[[155, 27.5, 1.6], [143, 49, 1.1], [155, 45, 1.1], [167, 49, 1.1]].map(([x, y, r], i) => (
        <motion.circle
          key={`o${i}`} cx={x} cy={y} r={r} fill={GOLD}
          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.6, 1] }}
          transition={{ delay: 2.3 + i * 0.15, duration: 1.4, repeat: Infinity, repeatType: "mirror", repeatDelay: 2 }}
        />
      ))}

      {/* gold finials */}
      {FINIALS.map(([x, y], i) => (
        <motion.circle
          key={`f${i}`} cx={x} cy={y} r={1.6} fill={GOLD}
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: [0, 1.6, 1] }}
          transition={{ delay: 3 + i * 0.08, duration: 0.9 }}
        />
      ))}
      {/* the spire sparkles */}
      <motion.path
        d="M155 0 V8 M151 4 H159" stroke="#e2b85a" strokeWidth={1.1} strokeLinecap="round"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0.3, 1, 0], scale: [0, 1.2, 0.8, 1.1, 0], rotate: [0, 45, 90] }}
        transition={{ delay: 3.3, duration: 2.2, repeat: Infinity, repeatDelay: 3.5 }}
      />

      {/* ── Chain Bridge ── */}
      <motion.path id="pl-bridge" d={BRIDGE} {...ink} strokeWidth={1.5} fill="url(#pl-facade)"
        initial={{ pathLength: 0, opacity: 0, fillOpacity: 0 }}
        animate={{ pathLength: 1, opacity: 1, fillOpacity: 1 }}
        transition={{ pathLength: { duration: 2, delay: 1.2, ease: EASE }, opacity: { duration: 0.4, delay: 1.2 }, fillOpacity: { duration: 1.2, delay: 2.4 } }}
      />
      <motion.path d={DECK_PATH} {...ink} strokeWidth={1.3} {...draw(1.6, 1.6)} />
      <motion.path d={CHAINS} {...ink} strokeWidth={1.5} {...draw(2.0, 1.8)} />
      <motion.path d={HANGERS} {...ink} strokeWidth={0.7} strokeOpacity={0.8} {...draw(2.6, 1.4)} />
      {PYLONS.map((c, i) => (
        <motion.circle key={`crest${c}`} cx={c} cy={71.5} r={1.3} fill={GOLD}
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: [0, 1.5, 1] }}
          transition={{ delay: 3 + i * 0.2, duration: 0.8 }}
        />
      ))}
      {/* a glint running along the chain */}
      <motion.path
        d={MAIN_CHAIN} stroke="#f3d27a" strokeWidth={2.2} strokeLinecap="round"
        initial={{ pathLength: 0.1, pathOffset: 0, opacity: 0 }}
        animate={{ pathOffset: [0, 0.9], opacity: [0, 1, 1, 0] }}
        transition={{ delay: 3.8, duration: 1.8, repeat: Infinity, repeatDelay: 4.5, ease: "easeInOut" }}
      />
      {/* lamps come on one by one */}
      {LAMPS.map((x, i) => (
        <g key={`lamp${x}`}>
          <motion.path d={`M${x} ${lampBase(x)} V${lampBase(x) - 5.5}`} {...ink} strokeWidth={0.9} {...draw(2.2 + i * 0.1, 0.5)} />
          <motion.circle cx={x} cy={lampBase(x) - 6.8} r={5} fill="url(#pl-lamp)"
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0.55, 0.9] }}
            transition={{ delay: 3.2 + i * 0.22, duration: 2, repeat: Infinity, repeatType: "mirror" }}
          />
          <motion.circle cx={x} cy={lampBase(x) - 6.8} r={1.2} fill={GOLD}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2 + i * 0.22, duration: 0.3 }}
          />
        </g>
      ))}

      {/* the embankment, and the yellow no. 2 tram running along it */}
      <motion.path d={`M0 ${WATER} H290`} {...ink} strokeWidth={1.4} {...draw(0.2, 1.6)} />
      <motion.g
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: [-30, 262], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 16, repeat: Infinity, delay: 3.4, ease: "linear", times: [0, 0.06, 0.92, 1] }}
      >
        <path d="M9 118.6 L11 115.4 L13 118.6" stroke="#1b3366" strokeWidth={0.7} strokeLinejoin="round" />
        <rect x={0} y={118.6} width={24} height={6.6} rx={1.6} fill="#f2c14e" stroke="#1b3366" strokeWidth={0.7} />
        {[2.2, 6.6, 11, 15.4, 19.8].map((wx) => (
          <rect key={wx} x={wx} y={119.8} width={2.6} height={2.3} rx={0.4} fill="#fff7dd" stroke="#1b3366" strokeWidth={0.4} />
        ))}
        <path d="M0.6 123.4 H23.4" stroke="#1b3366" strokeWidth={0.5} strokeOpacity={0.6} />
      </motion.g>

      {/* ── the Danube ── */}
      {/* reflection of the whole scene, rippling */}
      <g mask="url(#pl-fade)">
        <g filter="url(#pl-ripple)">
          <g transform={`matrix(1 0 0 -1 0 ${WATER * 2})`} opacity={0.38}>
            <use href="#pl-body" />
            <use href="#pl-bridge" />
          </g>
        </g>
      </g>

      {/* sun and lamp sparkles on the water */}
      {[[155, 130, 18], [155, 135, 13], [155, 140.5, 9], [155, 146.5, 5]].map(([x, y, w], i) => (
        <motion.path
          key={`sun${i}`} d={`M${x - w / 2} ${y} h${w}`} stroke="#e2b85a" strokeWidth={1.2} strokeLinecap="round"
          initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0.3, 0.8], x: [0, 2, -2, 0] }}
          transition={{ delay: 2 + i * 0.2, duration: 3 + i * 0.6, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {LAMPS.map((x, i) => (
        <motion.path
          key={`lr${x}`} d={`M${x - 2} ${150 + (i % 2) * 2} h4`} stroke={GOLD} strokeWidth={1} strokeLinecap="round"
          initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0.15, 0.6], x: [0, 1, -1, 0] }}
          transition={{ delay: 3.4 + i * 0.22, duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* waves */}
      {[0, 1, 2, 3].map((i) => {
        const y = 133 + i * 9 + i * i;
        return (
          <motion.path
            key={`r${i}`}
            d={`M0 ${y} Q55 ${y - 2.5} 110 ${y} T220 ${y} T330 ${y} T440 ${y}`}
            stroke="#2e56a6" strokeOpacity={0.38 - i * 0.07} strokeWidth={1}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, x: [0, i % 2 ? 8 : -8, 0] }}
            transition={{ pathLength: { duration: 2, delay: 1 + i * 0.2 }, x: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" } }}
          />
        );
      })}

      {/* a river cruise boat heading upstream */}
      <motion.g
        initial={{ x: 480, opacity: 0 }}
        animate={{ x: [480, -60], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 30, repeat: Infinity, delay: 2.2, ease: "linear", times: [0, 0.04, 0.96, 1] }}
      >
        <motion.g animate={{ y: [0, -0.8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M-6 152 h-10 M-4 154.5 h-7" stroke="#2e56a6" strokeOpacity={0.35} strokeWidth={0.8} strokeLinecap="round" />
          <path d="M0 149 H40 L37 153.5 H4 Z" fill="#1b3366" />
          <path d="M5 149 V144 H33 V149" fill="#ffffff" stroke="#1b3366" strokeWidth={0.8} strokeLinejoin="round" />
          <path d="M7 144 V141.6 H22 V144" fill="#ffffff" stroke="#1b3366" strokeWidth={0.7} strokeLinejoin="round" />
          {[7.5, 11, 14.5, 18, 21.5, 25, 28.5].map((wx) => (
            <rect key={wx} x={wx} y={145.4} width={2.2} height={2} rx={0.3} fill={GOLD} />
          ))}
        </motion.g>
      </motion.g>

      {/* a little boat drifting down */}
      <motion.g
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: [-40, 470], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 22, repeat: Infinity, delay: 4, ease: "linear", times: [0, 0.05, 0.95, 1] }}
      >
        <motion.g animate={{ y: [0, -1, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M-4 167 h-8" stroke="#2e56a6" strokeOpacity={0.35} strokeWidth={0.8} strokeLinecap="round" />
          <path d="M0 163 h18 l-3 4 h-12 z" fill="#1b3366" />
          <path d="M6 163 v-6 h6 v6" stroke="#1b3366" strokeWidth={1} />
          <rect x={7.5} y={158.5} width={1.6} height={1.6} fill={GOLD} />
          <rect x={10} y={158.5} width={1.6} height={1.6} fill={GOLD} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
