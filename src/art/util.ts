import { SCALE } from "../config";

export interface Layer {
  c: HTMLCanvasElement;
  g: CanvasRenderingContext2D;
  w: number;
  h: number;
}

// Off-screen canvas used to pre-render a layer once (fast to draw every frame).
export function makeLayer(w: number, h: number): Layer {
  const c = document.createElement("canvas");
  c.width = Math.ceil(w * SCALE);
  c.height = Math.ceil(h * SCALE);
  const g = c.getContext("2d")!;
  g.scale(SCALE, SCALE);
  return { c, g, w, h };
}

export type Rand = () => number;

// Seeded random so the art looks the same every run.
export function rng(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(r: Rand, a: T[]): T {
  return a[Math.floor(r() * a.length)];
}

function toRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = toRgb(a);
  const [r2, g2, b2] = toRgb(b);
  const f = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${f(r1, r2)},${f(g1, g2)},${f(b1, b2)})`;
}

// amt > 0 lightens, amt < 0 darkens. Input must be #rrggbb.
export function shade(hex: string, amt: number): string {
  return amt >= 0 ? mix(hex, "#ffffff", amt) : mix(hex, "#000000", -amt);
}

// Draw a seamless horizontally scrolling layer.
export function tiled(g: CanvasRenderingContext2D, l: Layer, offset: number, y: number): void {
  const off = ((offset % l.w) + l.w) % l.w;
  g.drawImage(l.c, -off, y, l.w, l.h);
  g.drawImage(l.c, l.w - off, y, l.w, l.h);
}

export function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

// Shrinks the font until the text fits maxW. Returns the final size.
export function fitFont(
  g: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  size: number,
  family: string,
  weight = "bold"
): number {
  let s = size;
  g.font = `${weight} ${s}px ${family}`;
  while (g.measureText(text).width > maxW && s > 6) {
    s -= 1;
    g.font = `${weight} ${s}px ${family}`;
  }
  return s;
}
