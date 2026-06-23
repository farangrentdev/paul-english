// Hand-drawn marker doodles (перенос из прототипа). Чистый SVG — без хуков,
// работает и в server-, и в client-компонентах.
import type { CSSProperties } from "react";

type D = { w?: number; h?: number; color?: string; sw?: number; style?: CSSProperties };

export function Squiggle({ w = 120, h = 16, color = "var(--ink)", sw = 2.5, style }: D) {
  return (
    <svg className="doodle" width={w} height={h} viewBox="0 0 120 16" fill="none" style={style}>
      <path d="M2 9 C 14 1, 22 1, 32 8 S 52 15, 62 8 S 84 1, 94 8 S 112 15, 118 7" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

export function Underline({ w = 200, h = 22, color = "var(--accent-deep)", sw = 4, style }: D) {
  return (
    <svg className="doodle" width={w} height={h} viewBox="0 0 200 22" fill="none" style={style}>
      <path d="M5 13 C 60 5, 120 22, 196 9" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

export function CircleScribble({ w = 220, h = 120, color = "var(--accent-deep)", sw = 3.5, style }: D) {
  return (
    <svg className="doodle" width={w} height={h} viewBox="0 0 220 120" fill="none" style={style}>
      <path d="M120 8 C 60 4, 18 26, 14 60 C 10 96, 70 114, 124 112 C 182 110, 210 86, 206 54 C 202 24, 168 8, 108 9" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

export function Arrow({ w = 120, h = 90, color = "var(--ink)", sw = 3, style }: D) {
  return (
    <svg className="doodle" width={w} height={h} viewBox="0 0 120 90" fill="none" style={style}>
      <path d="M8 10 C 40 6, 96 18, 102 64" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <path d="M86 50 L102 66 L112 44" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowDown({ w = 60, h = 120, color = "var(--ink)", sw = 3, style }: D) {
  return (
    <svg className="doodle" width={w} height={h} viewBox="0 0 60 120" fill="none" style={style}>
      <path d="M30 6 C 22 36, 38 64, 30 104" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <path d="M14 88 L30 110 L46 86" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Star({ s = 40, color = "var(--ink)", sw = 3, style }: { s?: number; color?: string; sw?: number; style?: CSSProperties }) {
  return (
    <svg className="doodle" width={s} height={s} viewBox="0 0 40 40" fill="none" style={style}>
      <path d="M20 3 L20 37 M3 20 L37 20 M8 8 L32 32 M32 8 L8 32" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

export function Spark({ s = 30, color = "var(--accent-deep)", style }: { s?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg className="doodle" width={s} height={s} viewBox="0 0 30 30" fill="none" style={style}>
      <path d="M15 1 C 16 10, 20 14, 29 15 C 20 16, 16 20, 15 29 C 14 20, 10 16, 1 15 C 10 14, 14 10, 15 1Z" fill={color} stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Bracket({ w = 40, h = 120, color = "var(--ink)", sw = 3, side = "left", style }: D & { side?: "left" | "right" }) {
  const d = side === "left" ? "M30 6 C 12 12, 12 108, 30 114" : "M10 6 C 28 12, 28 108, 10 114";
  return (
    <svg className="doodle" width={w} height={h} viewBox="0 0 40 120" fill="none" style={style}>
      <path d={d} stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

export function Scratch({ w = 80, h = 80, color = "var(--ink)", sw = 2.4, style }: D) {
  return (
    <svg className="doodle" width={w} height={h} viewBox="0 0 80 80" fill="none" style={style}>
      <path d="M8 20 L72 16 M6 36 L74 31 M10 52 L70 47 M8 67 L72 62" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}
