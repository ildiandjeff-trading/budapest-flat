"use client";
import { motion } from "framer-motion";

/*
 * Fisherman's Bastion at night, drawn like the intro skyline: the outline draws
 * itself in, lamps glow in the arcades, a flag waves on the main tower, Matthias
 * Church rises behind, the moon comes up and stars twinkle over the Danube.
 * Light strokes, made to sit on the navy card.
 */

const GROUND = 128;
const EASE = [0.65, 0, 0.35, 1] as const;
const GOLD = "#e9c46a";
const LAMP = "#ffd37a"; // warm lamplight, stays bright on navy

// a row of arches along a wall: one sub-path per arch
const arches = (from: number, to: number, step: number, w: number, base: number, rise: number) => {
  const out: string[] = [];
  for (let x = from; x + w <= to; x += step) {
    out.push(`M${x} ${base} V${base - rise} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${base - rise} V${base}`);
  }
  return out.join(" ");
};

type Tower = { cx: number; w: number; base: number; top: number; peak: number };

// seven towers, one for each of the seven Magyar tribes; the main one first
const towers: Tower[] = [
  { cx: 220, w: 30, base: 86, top: 54, peak: 10 },
  { cx: 170, w: 16, base: 86, top: 62, peak: 40 },
  { cx: 270, w: 16, base: 86, top: 62, peak: 40 },
  { cx: 124, w: 16, base: 86, top: 66, peak: 46 },
  { cx: 316, w: 16, base: 86, top: 66, peak: 46 },
  { cx: 64, w: 14, base: 106, top: 84, peak: 66 },
  { cx: 376, w: 14, base: 106, top: 84, peak: 66 },
];
// draw from the centre outward
const towerDelay = [1.0, 1.2, 1.2, 1.4, 1.4, 1.6, 1.6];

const towerPath = ({ cx, w, base, top, peak }: Tower, i: number) => {
  const l = cx - w / 2;
  const r = cx + w / 2;
  if (i === 0) {
    // main tower: body, arcaded drum, tall pointed roof
    return [
      `M${l} ${base} V${top} H${r} V${base}`,
      `M${l + 4} ${top} V40 H${r - 4} V${top}`,
      `M${l + 2} 40 L${cx} ${peak} L${r - 2} 40 Z`,
      `M${l + 1} 40 H${r - 1}`,
      arches(l + 5.5, r - 4, 7, 5, 76, 6),
      arches(l + 7, r - 6, 6, 4, 51, 3),
    ].join(" ");
  }
  return [
    `M${l} ${base} V${top} L${cx} ${peak} L${r} ${top} V${base}`,
    `M${l - 2} ${top} H${r + 2}`,
    windowPath(cx, (base + top) / 2),
  ].join(" ");
};
const windowPath = (cx: number, mid: number) =>
  `M${cx - 2.5} ${mid + 4} V${mid - 1} A2.5 2.5 0 0 1 ${cx + 2.5} ${mid - 1} V${mid + 4}`;

// balustrades, broken where the towers stand so no line crosses a tower
const upperRail = "M86 83 H116 M132 83 H162 M178 83 H205 M235 83 H262 M278 83 H308 M324 83 H354";
const lowerRail = "M28 102 H57 M71 102 H86 M354 102 H369 M383 102 H412";

// every other arch of the upper colonnade has a lamp in it
const lamps = [92, 120, 148, 176, 204, 232, 260, 288, 316, 344];
// and a few of the big arches below
const lowLamps = [82, 148, 214, 280, 346];

const stars: [number, number][] = [
  [24, 22], [46, 48], [150, 16], [190, 26], [252, 20], [292, 36], [338, 14], [362, 48], [392, 30], [430, 54],
];

export default function Bastion({ className = "" }: { className?: string }) {
  const stroke = {
    stroke: "url(#bst-ink)",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const draw = (delay: number, duration = 1.8) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration, delay, ease: EASE },
  });

  return (
    <svg viewBox="0 0 440 140" fill="none" className={className} role="img" aria-label="Fisherman's Bastion at night">
      <defs>
        <linearGradient id="bst-ink" x1="0" x2="440" y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f3d27a" />
          <stop offset="0.35" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cfe0ff" />
        </linearGradient>
        <radialGradient id="bst-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff4cf" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#fff4cf" stopOpacity="0.15" />
          <stop offset="1" stopColor="#fff4cf" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bst-trail" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* stars */}
      {stars.map(([x, y], i) => (
        <motion.circle
          key={`s${i}`} cx={x} cy={y} r={i % 3 === 0 ? 1.2 : 0.8} fill="#ffffff"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0.3, 0.9] }}
          transition={{ delay: 0.4 + i * 0.12, duration: 1.6 + (i % 4) * 0.5, repeat: Infinity, repeatType: "mirror" }}
        />
      ))}

      {/* the moon rises */}
      <motion.g initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 2.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
        <motion.circle cx={88} cy={28} r={22} fill="url(#bst-halo)" animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "88px 28px" }} />
        <circle cx={88} cy={28} r={7.5} fill="#fff4cf" />
        <circle cx={85.5} cy={26.5} r={1.4} fill="#e9dcae" />
        <circle cx={90.5} cy={30.5} r={1} fill="#e9dcae" />
      </motion.g>

      {/* now and then a shooting star */}
      <motion.g
        initial={{ x: 430, y: 6, opacity: 0 }}
        animate={{ x: [430, 300], y: [6, 40], opacity: [0, 1, 0] }}
        transition={{ duration: 1.1, delay: 4, repeat: Infinity, repeatDelay: 9, ease: "easeOut" }}
      >
        <path d="M0 0 L22 -6" stroke="url(#bst-trail)" strokeWidth={1.2} strokeLinecap="round" />
      </motion.g>

      {/* Matthias Church behind, to the right, drawn fainter */}
      <motion.path
        d={[
          "M386 106 V82 L396 70 L406 82",
          "M406 106 V54 H418 V106",
          "M406 54 L412 16 L418 54",
          "M406 54 V48 M418 54 V48",
          "M410 72 V66 A2 2 0 0 1 414 66 V72",
          "M409 40 L412 30 L415 40",
        ].join(" ")}
        {...stroke} strokeWidth={1.2} strokeOpacity={0.55}
        {...draw(1.9, 1.6)}
      />
      <motion.path
        d="M412 16 V8 M409.5 10.5 H414.5"
        stroke={GOLD} strokeWidth={1.2} strokeLinecap="round"
        initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ delay: 3.2, duration: 0.8 }}
      />

      {/* ground and the steps up to the terrace */}
      <motion.path d={`M4 ${GROUND} H436`} {...stroke} {...draw(0.2, 1.4)} />
      <motion.path d="M4 128 H9 V124 H13 V120 H17 V116 H21 V112 H25 V108 H28" {...stroke} {...draw(0.3, 1.2)} />

      {/* lower terrace with its big arcade */}
      <motion.path d={`M28 ${GROUND} V106 H412 V${GROUND}`} {...stroke} {...draw(0.35)} />
      <motion.path d={lowerRail} {...stroke} strokeWidth={1} {...draw(0.55, 1.6)} />
      <motion.path d={arches(38, 404, 22, 12, GROUND, 9)} {...stroke} strokeWidth={1.3} {...draw(0.6, 2)} />

      {/* upper gallery and colonnade */}
      <motion.path d="M86 106 V86 H354 V106" {...stroke} {...draw(0.7)} />
      <motion.path d={upperRail} {...stroke} strokeWidth={1} {...draw(0.85, 1.4)} />
      <motion.path d={arches(92, 352, 14, 8, 106, 9)} {...stroke} strokeWidth={1.2} {...draw(0.9, 1.8)} />

      {/* lamps glowing in the arcades */}
      {lamps.map((x, i) => (
        <motion.path
          key={`l${x}`}
          d={`M${x + 1.2} 105.5 V97 A2.8 2.8 0 0 1 ${x + 6.8} 97 V105.5 Z`}
          fill={LAMP}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.95, 0.6, 0.95] }}
          transition={{ delay: 2.6 + i * 0.1, duration: 1.4, repeat: Infinity, repeatType: "mirror", repeatDelay: 1.2 + (i % 3) }}
        />
      ))}
      {lowLamps.map((x, i) => (
        <motion.path
          key={`ll${x}`}
          d={`M${x + 1.5} 127.5 V119 A4.5 4.5 0 0 1 ${x + 10.5} 119 V127.5 Z`}
          fill={LAMP}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.85, 0.5, 0.85] }}
          transition={{ delay: 3 + i * 0.15, duration: 1.8, repeat: Infinity, repeatType: "mirror", repeatDelay: 2 + (i % 2) }}
        />
      ))}

      {/* the seven towers */}
      {towers.map((t, i) => (
        <motion.path key={`t${i}`} d={towerPath(t, i)} {...stroke} {...draw(towerDelay[i])} />
      ))}

      {/* tower windows light up */}
      {towers.slice(1).map((t, i) => (
        <motion.path
          key={`w${i}`}
          d={`${windowPath(t.cx, (t.base + t.top) / 2)} Z`}
          fill={LAMP}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.95, 0.6, 0.95] }}
          transition={{ delay: 2.8 + i * 0.12, duration: 1.6, repeat: Infinity, repeatType: "mirror", repeatDelay: 2.5 + (i % 3) }}
        />
      ))}
      {[210.5, 217.5, 224.5].map((x, i) => (
        <motion.path
          key={`mw${x}`}
          d={`M${x + 0.8} 76 V70 A1.7 1.7 0 0 1 ${x + 4.2} 70 V76 Z`}
          fill={LAMP}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.95, 0.6, 0.95] }}
          transition={{ delay: 2.7 + i * 0.1, duration: 1.3, repeat: Infinity, repeatType: "mirror", repeatDelay: 1.8 }}
        />
      ))}

      {/* gold finials pop on the tower tips */}
      {towers.slice(1).map((t, i) => (
        <motion.circle
          key={`f${i}`} cx={t.cx} cy={t.peak - 2} r={1.5} fill={GOLD}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0.7, 1], scale: [0, 1.6, 1] }}
          transition={{ delay: 2.4 + towerDelay[i + 1] * 0.5, duration: 1.4 }}
          style={{ transformOrigin: `${t.cx}px ${t.peak - 2}px` }}
        />
      ))}

      {/* flag on the main tower */}
      <motion.path
        d="M220 10 V1"
        stroke="#ffffff" strokeWidth={1} strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 2.6, duration: 0.5 }}
      />
      <motion.path
        fill={GOLD}
        initial={{ opacity: 0, d: "M220 1 Q223 0 226 1 Q229 2 232 1 V6 Q229 7 226 6 Q223 5 220 6 Z" }}
        animate={{
          opacity: 1,
          d: [
            "M220 1 Q223 0 226 1 Q229 2 232 1 V6 Q229 7 226 6 Q223 5 220 6 Z",
            "M220 1 Q223 2 226 1 Q229 0 232 1.5 V6.5 Q229 5 226 6 Q223 7 220 6 Z",
            "M220 1 Q223 0 226 1 Q229 2 232 1 V6 Q229 7 226 6 Q223 5 220 6 Z",
          ],
        }}
        transition={{ opacity: { delay: 3, duration: 0.6 }, d: { delay: 3, duration: 2.2, repeat: Infinity, ease: "easeInOut" } }}
      />

      {/* the Danube far below, with the moon shimmering in it */}
      {[0, 1].map((i) => (
        <motion.path
          key={`r${i}`}
          d={`M0 ${133 + i * 4} Q55 ${130.5 + i * 4} 110 ${133 + i * 4} T220 ${133 + i * 4} T330 ${133 + i * 4} T440 ${133 + i * 4}`}
          stroke="#cfe0ff" strokeOpacity={0.4 - i * 0.15} strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, x: [0, -8, 0] }}
          transition={{ pathLength: { duration: 2, delay: 1.1 + i * 0.2 }, x: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" } }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <motion.path
          key={`m${i}`}
          d={`M${84 - i * 2} ${132 + i * 3} h${8 + i * 4}`}
          stroke="#fff4cf" strokeWidth={1} strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0.2, 0.7], x: [0, 2, -2, 0] }}
          transition={{ delay: 2 + i * 0.2, duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}
