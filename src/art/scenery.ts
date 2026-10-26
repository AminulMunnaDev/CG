import { W, H } from "../config";
import { FONT_BN } from "./fonts";
import { Layer, Rand, makeLayer, rng, pick, shade, fitFont, rr } from "./util";

export const TW = W * 2; // width of every scrolling tile
export const Y = { clouds: 40, far: 230, buildings: 160, metro: 250, foot: 440, poles: 250, road: 548 };
export const SPEED = { clouds: 10, far: 14, buildings: 50, metro: 85, foot: 170, poles: 170, road: 230 };
const BASE = 500; // y where buildings touch the footpath

type G = CanvasRenderingContext2D;

/* ------------------------------------------------------------------ SKY */
export function buildSky(): Layer {
  const L = makeLayer(W, H);
  const g = L.g;
  const gr = g.createLinearGradient(0, 0, 0, 520);
  gr.addColorStop(0, "#4f4283");
  gr.addColorStop(0.35, "#c4607a");
  gr.addColorStop(0.7, "#f39a62");
  gr.addColorStop(1, "#ffd98a");
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);

  const sx = 350, sy = 385;
  const rg = g.createRadialGradient(sx, sy, 10, sx, sy, 280);
  rg.addColorStop(0, "rgba(255,244,190,0.95)");
  rg.addColorStop(0.25, "rgba(255,205,125,0.55)");
  rg.addColorStop(1, "rgba(255,160,100,0)");
  g.fillStyle = rg;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#fff3c4";
  g.beginPath();
  g.arc(sx, sy, 34, 0, Math.PI * 2);
  g.fill();

  for (let i = 0; i < 6; i++) {
    g.fillStyle = `rgba(255,190,130,${0.1 + i * 0.03})`;
    g.fillRect(0, 300 + i * 34, W, 22);
  }
  return L;
}

/* --------------------------------------------------------------- CLOUDS */
export function buildClouds(): Layer {
  const L = makeLayer(TW, 240);
  const g = L.g;
  const r = rng(3);
  const cloud = (x: number, y: number, s: number, a: number) => {
    for (const dx of [0, -TW]) {
      g.save();
      g.translate(x + dx, y);
      g.scale(s, s);
      g.fillStyle = `rgba(255,222,205,${a})`;
      for (const [px, py, pr] of [[0, 0, 26], [28, -10, 32], [62, -4, 28], [88, 6, 22], [-24, 8, 20]]) {
        g.beginPath();
        g.arc(px, py, pr, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = `rgba(235,140,150,${a * 0.55})`;
      g.beginPath();
      g.ellipse(32, 18, 74, 9, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
  };
  for (let i = 0; i < 7; i++) cloud(i * 140 + r() * 60, 60 + r() * 120, 0.7 + r() * 0.7, 0.45 + r() * 0.25);
  return L;
}

/* ------------------------------------------------------- FAR SKYLINE */
export function buildFar(): Layer {
  const L = makeLayer(TW, 280);
  const g = L.g;
  const r = rng(11);
  const col = "#9a6f9b";
  let x = 0;
  while (x < TW) {
    let w = 28 + r() * 44;
    if (TW - x < 70) w = TW - x;
    const h = 50 + r() * 150;
    g.fillStyle = col;
    g.fillRect(x, 280 - h, w + 1, h);
    g.fillStyle = "rgba(255,220,150,0.65)";
    for (let k = 0; k < h / 9; k++) {
      if (r() < 0.35) g.fillRect(x + 4 + r() * (w - 10), 280 - h + 6 + k * 9, 2.5, 3);
    }
    if (r() < 0.3) {
      g.fillStyle = col;
      g.fillRect(x + w / 2 - 1, 280 - h - 22, 2, 22);
    }
    x += w;
  }
  // Mosque with dome and two minarets (very Dhaka skyline)
  const mx = 300;
  g.fillStyle = "#8a5f8d";
  g.fillRect(mx - 45, 210, 90, 70);
  g.beginPath();
  g.arc(mx, 210, 28, Math.PI, 0);
  g.fill();
  g.fillRect(mx - 1.5, 168, 3, 14);
  for (const m of [mx - 58, mx + 52]) {
    g.fillRect(m, 120, 6, 160);
    g.beginPath();
    g.arc(m + 3, 120, 6, Math.PI, 0);
    g.fill();
    g.fillRect(m + 2, 104, 2, 10);
    g.fillRect(m - 2, 150, 14, 4);
  }
  const hz = g.createLinearGradient(0, 0, 0, 280);
  hz.addColorStop(0, "rgba(255,190,130,0)");
  hz.addColorStop(1, "rgba(255,190,130,0.5)");
  g.fillStyle = hz;
  g.fillRect(0, 0, TW, 280);
  return L;
}

/* ------------------------------------------------------------ BUILDINGS */
const BUILD_COLORS = ["#d9a066", "#c4786a", "#7fa9a3", "#e0c27a", "#a9a6b4", "#d98e8e", "#8fb07a", "#c9b8a0", "#6f8fb5", "#e3a76f"];
const SIGNS: [string, string][] = [
  ["ফার্মেসি", "#1e8f5a"], ["চা-নাস্তা", "#c0392b"], ["মোবাইল সার্ভিস", "#2c3e8f"], ["হোটেল", "#8e44ad"],
  ["মুদি দোকান", "#d35400"], ["বিরিয়ানি হাউস", "#b71c1c"], ["ডায়াগনস্টিক", "#00838f"], ["সেলুন", "#455a64"],
  ["ফুলের দোকান", "#ad1457"], ["টাউন হল মার্কেট", "#33691e"],
];

function windowAt(g: G, x: number, y: number, r: Rand): void {
  const w = 16, h = 22;
  g.fillStyle = "#3a2a20";
  g.fillRect(x - 2, y - 2, w + 4, h + 4);
  const s = r();
  if (s < 0.3) {
    const gr = g.createLinearGradient(0, y, 0, y + h);
    gr.addColorStop(0, "#ffe9a3");
    gr.addColorStop(1, "#ffb45c");
    g.fillStyle = gr;
    g.fillRect(x, y, w, h);
    if (r() < 0.5) {
      g.fillStyle = "rgba(60,30,20,0.55)";
      g.beginPath();
      g.arc(x + w / 2, y + h - 11, 3.5, 0, Math.PI * 2);
      g.fill();
      g.fillRect(x + w / 2 - 5, y + h - 8, 10, 8);
    }
  } else if (s < 0.55) {
    g.fillStyle = "#3f7d5a";
    g.fillRect(x, y, w, h);
    g.strokeStyle = "rgba(0,0,0,0.35)";
    g.lineWidth = 1;
    for (let k = 3; k < h; k += 4) {
      g.beginPath();
      g.moveTo(x, y + k);
      g.lineTo(x + w, y + k);
      g.stroke();
    }
    g.fillStyle = "rgba(255,255,255,0.12)";
    g.fillRect(x, y, w / 2, h);
  } else {
    const gr = g.createLinearGradient(x, y, x + w, y + h);
    gr.addColorStop(0, "#4b6178");
    gr.addColorStop(1, "#1c2a38");
    g.fillStyle = gr;
    g.fillRect(x, y, w, h);
    if (s < 0.75) {
      g.fillStyle = pick(r, ["#e57fa0", "#f2c14e", "#7fc4e5"]);
      g.fillRect(x, y, w * 0.55, h * 0.85);
    }
  }
  if (r() < 0.5) {
    g.strokeStyle = "rgba(20,15,10,0.85)";
    g.lineWidth = 1;
    for (let k = 4; k < w; k += 4) {
      g.beginPath();
      g.moveTo(x + k, y);
      g.lineTo(x + k, y + h);
      g.stroke();
    }
  }
  g.fillStyle = "rgba(255,255,255,0.28)";
  g.fillRect(x - 3, y + h + 2, w + 6, 2);
}

function awning(g: G, x: number, y: number, w: number, c1: string, c2: string): void {
  const sw = 9;
  const n = Math.max(1, Math.round(w / sw));
  const aw = w / n;
  for (let i = 0; i < n; i++) {
    g.fillStyle = i % 2 ? c1 : c2;
    g.beginPath();
    g.moveTo(x + i * aw, y);
    g.lineTo(x + (i + 1) * aw, y);
    g.lineTo(x + (i + 1) * aw, y + 9);
    g.arc(x + (i + 0.5) * aw, y + 9, aw / 2, 0, Math.PI);
    g.closePath();
    g.fill();
  }
}

function shop(g: G, x: number, y: number, w: number, h: number, r: Rand): void {
  const gr = g.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, "#2a1b12");
  gr.addColorStop(1, "#6b4426");
  g.fillStyle = gr;
  g.fillRect(x, y, w, h);
  g.fillStyle = "rgba(255,205,120,0.22)";
  g.fillRect(x + 2, y + 8, w - 4, h - 12);
  for (let sy = y + 16; sy < y + h - 6; sy += 11) {
    g.fillStyle = "rgba(0,0,0,0.4)";
    g.fillRect(x + 3, sy + 8, w - 6, 2);
    for (let gx = x + 4; gx < x + w - 8; gx += 7) {
      g.fillStyle = pick(r, ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71", "#ecf0f1", "#e67e22"]);
      g.fillRect(gx, sy + r() * 3, 5, 8 - r() * 3);
    }
  }
  g.fillStyle = "#9aa0a6";
  g.fillRect(x - 2, y - 2, w + 4, 9);
  g.strokeStyle = "rgba(0,0,0,0.3)";
  g.lineWidth = 1;
  for (let k = 2; k < 9; k += 3) {
    g.beginPath();
    g.moveTo(x - 2, y + k);
    g.lineTo(x + w + 2, y + k);
    g.stroke();
  }
}

function signboard(g: G, x: number, y: number, w: number, text: string, col: string): void {
  rr(g, x, y, w, 17, 3);
  g.fillStyle = col;
  g.fill();
  g.strokeStyle = "rgba(255,255,255,0.55)";
  g.lineWidth = 1;
  g.stroke();
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  fitFont(g, text, w - 8, 12, FONT_BN, "800");
  g.fillText(text, x + w / 2, y + 9);
  g.textBaseline = "alphabetic";
}

function waterTank(g: G, x: number, y: number, col: string): void {
  g.fillStyle = "#444";
  g.fillRect(x + 2, y - 6, 2, 6);
  g.fillRect(x + 18, y - 6, 2, 6);
  const gr = g.createLinearGradient(x, 0, x + 22, 0);
  gr.addColorStop(0, shade(col, 0.25));
  gr.addColorStop(1, shade(col, -0.3));
  g.fillStyle = gr;
  g.fillRect(x, y - 24, 22, 18);
  g.beginPath();
  g.ellipse(x + 11, y - 24, 11, 4, 0, 0, Math.PI * 2);
  g.fillStyle = shade(col, 0.3);
  g.fill();
  g.fillStyle = "#222";
  g.fillRect(x + 8, y - 30, 6, 4);
}

function drawBuilding(g: G, x: number, top: number, w: number, h: number, r: Rand): void {
  const base = top + h;
  const col = pick(r, BUILD_COLORS);
  const gr = g.createLinearGradient(0, top, 0, base);
  gr.addColorStop(0, shade(col, 0.14));
  gr.addColorStop(1, shade(col, -0.25));
  g.fillStyle = gr;
  g.fillRect(x, top, w, h);
  g.fillStyle = "rgba(0,0,0,0.13)";
  g.fillRect(x + w - 5, top, 5, h);
  g.fillStyle = "rgba(255,255,255,0.1)";
  g.fillRect(x, top, 3, h);

  g.fillStyle = shade(col, -0.18);
  g.fillRect(x - 2, top - 5, w + 4, 7);
  g.fillStyle = "rgba(255,255,255,0.2)";
  g.fillRect(x - 2, top - 5, w + 4, 2);

  for (let i = 0; i < 4; i++) {
    const sx = x + 6 + r() * (w - 12);
    const sh = 20 + r() * 60;
    const gs = g.createLinearGradient(0, top, 0, top + sh);
    gs.addColorStop(0, "rgba(40,30,20,0.3)");
    gs.addColorStop(1, "rgba(40,30,20,0)");
    g.fillStyle = gs;
    g.fillRect(sx, top, 3 + r() * 5, sh);
  }

  const gf = 62;
  const upperH = h - gf - 10;
  const floors = Math.max(2, Math.floor(upperH / 38));
  const fh = upperH / floors;
  const cols = Math.max(2, Math.floor((w - 12) / 26));
  const cw = (w - 12) / cols;
  for (let f = 0; f < floors; f++) {
    const fy = top + 10 + f * fh;
    for (let c = 0; c < cols; c++) {
      const wx = x + 6 + c * cw + (cw - 16) / 2;
      windowAt(g, wx, fy + 6, r);
      if (r() < 0.22) {
        g.fillStyle = "#b9bcc0";
        g.fillRect(wx + 2, fy + 31, 12, 7);
        g.fillStyle = "#555";
        g.beginPath();
        g.arc(wx + 8, fy + 34.5, 2.6, 0, Math.PI * 2);
        g.fill();
      }
    }
    if (r() < 0.35) {
      const sy = fy + fh - 6;
      g.fillStyle = shade(col, 0.2);
      g.fillRect(x + 2, sy, w - 4, 4);
      g.fillStyle = "rgba(30,20,15,0.8)";
      for (let k = x + 4; k < x + w - 4; k += 5) g.fillRect(k, sy - 10, 1.2, 10);
      g.fillRect(x + 2, sy - 10, w - 4, 1.2);
      if (r() < 0.6) {
        const lx = x + 6 + r() * (w * 0.3);
        const lw = w * 0.45;
        g.strokeStyle = "#222";
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(lx, sy - 22);
        g.lineTo(lx + lw, sy - 22);
        g.stroke();
        for (let k = lx + 3; k < lx + lw - 4; k += 8) {
          g.fillStyle = pick(r, ["#e74c3c", "#f1c40f", "#fff", "#3498db", "#e67e22"]);
          g.fillRect(k, sy - 22, 6, 11);
        }
      } else {
        for (let k = x + 8; k < x + w - 10; k += 22) {
          g.fillStyle = "#a0522d";
          g.fillRect(k, sy - 5, 6, 5);
          g.fillStyle = "#2e8b3d";
          g.beginPath();
          g.arc(k + 3, sy - 8, 5, 0, Math.PI * 2);
          g.fill();
        }
      }
    }
  }

  // roof
  if (r() < 0.8) waterTank(g, x + 8 + r() * (w * 0.4), top - 5, pick(r, ["#2b2b2b", "#2f6fa8", "#3a7d44"]));
  if (r() < 0.4) {
    g.fillStyle = "#555";
    g.fillRect(x + w - 16, top - 24, 2, 19);
    g.strokeStyle = "#555";
    g.beginPath();
    g.moveTo(x + w - 22, top - 20);
    g.lineTo(x + w - 9, top - 20);
    g.moveTo(x + w - 20, top - 15);
    g.lineTo(x + w - 11, top - 15);
    g.stroke();
  }
  if (r() < 0.35) {
    g.fillStyle = "#d8d8d8";
    g.beginPath();
    g.ellipse(x + w * 0.7, top - 11, 9, 6, -0.5, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#777";
    g.beginPath();
    g.moveTo(x + w * 0.7, top - 11);
    g.lineTo(x + w * 0.7 + 5, top - 5);
    g.stroke();
  }

  // ground-floor shops
  const n = w > 110 ? 2 : 1;
  const sw = (w - 8) / n;
  for (let i = 0; i < n; i++) {
    const sx = x + 4 + i * sw;
    const [txt, sc] = pick(r, SIGNS);
    shop(g, sx + 2, base - gf + 17, sw - 4, gf - 17, r);
    const [a, b] = pick(r, [["#c0392b", "#f5f0e6"], ["#1e8f5a", "#f5f0e6"], ["#2c5aa0", "#f5f0e6"], ["#e67e22", "#f5f0e6"]]);
    awning(g, sx + 1, base - gf + 19, sw - 2, a, b);
    signboard(g, sx + 2, base - gf + 1, sw - 4, txt, sc);
  }
  g.fillStyle = "rgba(0,0,0,0.25)";
  g.fillRect(x, base - 3, w, 3);

  g.strokeStyle = "rgba(40,20,20,0.4)";
  g.lineWidth = 1;
  g.strokeRect(x + 0.5, top + 0.5, w - 1, h - 1);
}

export function buildBuildings(): Layer {
  const L = makeLayer(TW, 340);
  const r = rng(7);
  let x = 0;
  while (x < TW) {
    let w = 78 + r() * 60;
    if (TW - x < 150) w = TW - x;
    const h = 190 + r() * 130;
    drawBuilding(L.g, x, 340 - h, w, h, r);
    x += w;
  }
  return L;
}

/* ---------------------------------------------------------------- METRO */
export function buildMetro(): Layer {
  const L = makeLayer(TW, 300);
  const g = L.g;
  const r = rng(21);

  // shadow cast by the viaduct onto the buildings
  const sh = g.createLinearGradient(0, 112, 0, 150);
  sh.addColorStop(0, "rgba(40,20,40,0.35)");
  sh.addColorStop(1, "rgba(40,20,40,0)");
  g.fillStyle = sh;
  g.fillRect(0, 112, TW, 38);

  // pillars (Y-shaped piers) with colourful murals
  for (const px of [240, 720]) {
    g.beginPath();
    g.moveTo(px - 52, 112);
    g.lineTo(px + 52, 112);
    g.lineTo(px + 52, 124);
    g.lineTo(px + 17, 146);
    g.lineTo(px + 17, 292);
    g.lineTo(px - 17, 292);
    g.lineTo(px - 17, 146);
    g.lineTo(px - 52, 124);
    g.closePath();
    const gr = g.createLinearGradient(px - 52, 0, px + 52, 0);
    gr.addColorStop(0, "#b9b5ae");
    gr.addColorStop(0.6, "#9a968f");
    gr.addColorStop(1, "#6f6c67");
    g.fillStyle = gr;
    g.fill();
    g.strokeStyle = "rgba(30,20,20,0.5)";
    g.lineWidth = 1.2;
    g.stroke();

    // mural strip
    g.save();
    g.beginPath();
    g.rect(px - 17, 176, 34, 108);
    g.clip();
    const mg = g.createLinearGradient(0, 176, 0, 284);
    mg.addColorStop(0, "#7ecbe8");
    mg.addColorStop(0.6, "#f6d36b");
    mg.addColorStop(1, "#4ea35c");
    g.fillStyle = mg;
    g.fillRect(px - 17, 176, 34, 108);
    g.fillStyle = "#ff7a2f";
    g.beginPath();
    g.arc(px, 206, 9, 0, Math.PI * 2);
    g.fill();
    for (let k = 0; k < 6; k++) {
      g.fillStyle = pick(r, ["#e74c3c", "#fff", "#e84393", "#f1c40f"]);
      g.beginPath();
      g.arc(px - 11 + r() * 22, 240 + r() * 40, 3 + r() * 3, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = "#2e7d32";
    for (let k = 0; k < 4; k++) g.fillRect(px - 14 + k * 8, 264 + r() * 8, 3, 20);
    g.restore();
    g.strokeStyle = "#2a1a14";
    g.lineWidth = 1.5;
    g.strokeRect(px - 17, 176, 34, 108);

    // red/white road barriers and pedestal
    g.fillStyle = "#8d8a86";
    g.fillRect(px - 24, 284, 48, 12);
    for (let k = 0; k < 6; k++) {
      g.fillStyle = k % 2 ? "#fff" : "#d32f2f";
      g.fillRect(px - 24 + k * 8, 288, 8, 8);
    }
  }

  // beam
  const bg = g.createLinearGradient(0, 80, 0, 112);
  bg.addColorStop(0, "#c9c5be");
  bg.addColorStop(0.5, "#a7a39c");
  bg.addColorStop(1, "#7d7a75");
  g.fillStyle = bg;
  g.fillRect(0, 80, TW, 32);
  g.fillStyle = "rgba(255,255,255,0.35)";
  g.fillRect(0, 80, TW, 3);
  g.fillStyle = "rgba(0,0,0,0.25)";
  g.fillRect(0, 108, TW, 4);
  g.strokeStyle = "rgba(40,30,30,0.35)";
  g.lineWidth = 1;
  for (let k = 0; k < TW; k += 60) {
    g.beginPath();
    g.moveTo(k, 83);
    g.lineTo(k, 108);
    g.stroke();
  }
  // safety railing on top
  g.fillStyle = "#6a6764";
  g.fillRect(0, 70, TW, 2);
  for (let k = 0; k < TW; k += 12) g.fillRect(k, 70, 1.5, 10);
  return L;
}

export function drawTrain(g: G, x: number): void {
  const len = 420, y = 66; // sits on the beam
  const body = g.createLinearGradient(0, y - 38, 0, y);
  body.addColorStop(0, "#fafafa");
  body.addColorStop(1, "#c9d3d6");
  for (let i = 0; i < 3; i++) {
    const cx = x + i * (len / 3) + 2;
    const cw = len / 3 - 4;
    rr(g, cx, y - 38, cw, 38, 8);
    g.fillStyle = body;
    g.fill();
    g.strokeStyle = "#2a1a14";
    g.lineWidth = 1.2;
    g.stroke();
    g.fillStyle = "#0b6b3a"; // green stripe
    g.fillRect(cx + 1, y - 12, cw - 2, 5);
    g.fillStyle = "#d32f2f"; // red stripe
    g.fillRect(cx + 1, y - 7, cw - 2, 3);
    for (let k = 0; k < 6; k++) {
      rr(g, cx + 8 + k * ((cw - 16) / 6), y - 31, (cw - 16) / 6 - 5, 14, 3);
      g.fillStyle = "#26384a";
      g.fill();
    }
  }
  // nose
  g.fillStyle = "#fafafa";
  g.beginPath();
  g.moveTo(x + len - 2, y - 38);
  g.quadraticCurveTo(x + len + 22, y - 30, x + len + 24, y);
  g.lineTo(x + len - 2, y);
  g.closePath();
  g.fill();
  g.stroke();
  g.fillStyle = "#ffeb99";
  g.fillRect(x + len + 14, y - 12, 7, 5);
}

/* ------------------------------------------------------------- FOOTPATH */
export function buildFootpath(): Layer {
  const L = makeLayer(TW, 108);
  const g = L.g;
  const r = rng(33);

  // paving
  const pg = g.createLinearGradient(0, 60, 0, 108);
  pg.addColorStop(0, "#a38f78");
  pg.addColorStop(1, "#c4b49c");
  g.fillStyle = pg;
  g.fillRect(0, 60, TW, 48);
  for (let x = 0; x < TW; x += 24) {
    for (let y = 60; y < 100; y += 14) {
      if (r() < 0.25) {
        g.fillStyle = "rgba(60,40,20,0.12)";
        g.fillRect(x, y, 24, 14);
      }
    }
  }
  g.strokeStyle = "rgba(70,50,30,0.35)";
  g.lineWidth = 1;
  for (let y = 60; y <= 100; y += 14) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(TW, y);
    g.stroke();
  }
  for (let x = 0; x < TW; x += 24) {
    g.beginPath();
    g.moveTo(x, 60);
    g.lineTo(x, 100);
    g.stroke();
  }
  const top = g.createLinearGradient(0, 60, 0, 72);
  top.addColorStop(0, "rgba(30,15,10,0.45)");
  top.addColorStop(1, "rgba(30,15,10,0)");
  g.fillStyle = top;
  g.fillRect(0, 60, TW, 12);
  // curb
  g.fillStyle = "#e1dbcf";
  g.fillRect(0, 100, TW, 8);
  g.fillStyle = "#fff";
  g.fillRect(0, 100, TW, 2);
  g.fillStyle = "rgba(0,0,0,0.35)";
  g.fillRect(0, 107, TW, 1);
  // drain grate
  g.fillStyle = "#2b2b2b";
  g.fillRect(380, 101, 30, 6);
  g.fillStyle = "#777";
  for (let k = 382; k < 408; k += 4) g.fillRect(k, 102, 1.5, 4);

  // --- tea stall (চা)
  const sx = 100;
  g.fillStyle = "#8b6b3e";
  for (const px of [sx - 2, sx + 118]) g.fillRect(px, 20, 3, 70);
  const cg = g.createLinearGradient(0, 8, 0, 36);
  cg.addColorStop(0, "#2f6db5");
  cg.addColorStop(1, "#1e4c86");
  g.fillStyle = cg;
  g.beginPath();
  g.moveTo(sx - 14, 36);
  g.lineTo(sx + 6, 10);
  g.lineTo(sx + 112, 10);
  g.lineTo(sx + 134, 36);
  g.closePath();
  g.fill();
  g.fillStyle = "#e8742a";
  g.beginPath();
  g.moveTo(sx - 14, 36);
  g.lineTo(sx - 8, 28);
  g.lineTo(sx + 128, 28);
  g.lineTo(sx + 134, 36);
  g.closePath();
  g.fill();
  g.strokeStyle = "#2a1a14";
  g.lineWidth = 1.2;
  g.stroke();
  // bananas hanging from a rope
  g.strokeStyle = "#5c4a30";
  g.beginPath();
  g.moveTo(sx + 6, 38);
  g.lineTo(sx + 100, 38);
  g.stroke();
  for (let k = 0; k < 4; k++) {
    for (let b = 0; b < 4; b++) {
      g.strokeStyle = "#f2c500";
      g.lineWidth = 3;
      g.beginPath();
      g.arc(sx + 18 + k * 22 + b * 3, 40, 8, 0.2, 2.2);
      g.stroke();
    }
  }
  // counter
  g.fillStyle = "#7a4b2a";
  g.fillRect(sx + 2, 56, 114, 34);
  g.strokeStyle = "rgba(0,0,0,0.35)";
  g.lineWidth = 1;
  for (let k = sx + 14; k < sx + 116; k += 14) {
    g.beginPath();
    g.moveTo(k, 58);
    g.lineTo(k, 90);
    g.stroke();
  }
  g.fillStyle = "#9b6338";
  g.fillRect(sx, 52, 118, 6);
  // kettle, jars, glasses
  g.fillStyle = "#c8ccd0";
  g.beginPath();
  g.ellipse(sx + 20, 44, 10, 8, 0, 0, Math.PI * 2);
  g.fill();
  g.fillRect(sx + 28, 40, 10, 3);
  for (let k = 0; k < 3; k++) {
    g.fillStyle = "rgba(235,245,250,0.85)";
    g.fillRect(sx + 52 + k * 18, 38, 12, 14);
    g.fillStyle = pick(r, ["#e8a24a", "#c97a3a", "#f2d9a0"]);
    g.fillRect(sx + 53 + k * 18, 44, 10, 7);
  }
  for (let k = 0; k < 4; k++) {
    g.fillStyle = "#fff";
    g.fillRect(sx + 100 + k * 3, 48, 2, 4);
  }
  // gas cylinder
  g.fillStyle = "#c62828";
  rr(g, sx + 124, 58, 14, 30, 5);
  g.fill();
  g.fillStyle = "#222";
  g.fillRect(sx + 128, 54, 6, 5);
  // bench + stools
  g.fillStyle = "#6b4a2a";
  g.fillRect(sx + 14, 94, 76, 4);
  g.fillRect(sx + 18, 98, 3, 8);
  g.fillRect(sx + 82, 98, 3, 8);
  // sign
  rr(g, sx + 46, 12, 28, 18, 3);
  g.fillStyle = "#fff3c4";
  g.fill();
  g.strokeStyle = "#2a1a14";
  g.stroke();
  g.fillStyle = "#b71c1c";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `bold 15px ${FONT_BN}`;
  g.fillText("চা", sx + 60, 22);
  g.textBaseline = "alphabetic";

  // --- fruit cart with umbrella
  const fx = 470;
  g.fillStyle = "#8b6b3e";
  g.fillRect(fx + 36, 14, 3, 60);
  g.beginPath();
  g.moveTo(fx - 22, 34);
  g.quadraticCurveTo(fx + 38, -12, fx + 98, 34);
  g.closePath();
  g.save();
  g.clip();
  for (let k = 0; k < 8; k++) {
    g.fillStyle = k % 2 ? "#ffd23f" : "#ffffff";
    g.fillRect(fx - 22 + k * 15, -14, 15, 60);
  }
  g.restore();
  g.strokeStyle = "#2a1a14";
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(fx - 22, 34);
  g.quadraticCurveTo(fx + 38, -12, fx + 98, 34);
  g.stroke();
  g.fillStyle = "#2a7ab8";
  g.fillRect(fx, 62, 76, 20);
  g.fillStyle = "#1c5a8a";
  g.fillRect(fx, 62, 76, 3);
  for (let k = 0; k < 24; k++) {
    g.fillStyle = pick(r, ["#e53935", "#fb8c00", "#7cb342", "#fdd835", "#d81b60"]);
    g.beginPath();
    g.arc(fx + 6 + (k % 12) * 5.8, 60 - Math.floor(k / 12) * 6, 4, 0, Math.PI * 2);
    g.fill();
  }
  for (const wx of [fx + 12, fx + 64]) {
    g.beginPath();
    g.arc(wx, 88, 10, 0, Math.PI * 2);
    g.fillStyle = "#222";
    g.fill();
    g.beginPath();
    g.arc(wx, 88, 4, 0, Math.PI * 2);
    g.fillStyle = "#aaa";
    g.fill();
  }

  // --- cute stray cat
  const cx = 660;
  g.fillStyle = "#e08a3c";
  g.beginPath();
  g.ellipse(cx, 92, 9, 11, 0, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.arc(cx + 2, 78, 7, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.moveTo(cx - 3, 73);
  g.lineTo(cx - 1, 66);
  g.lineTo(cx + 2, 72);
  g.moveTo(cx + 3, 72);
  g.lineTo(cx + 6, 66);
  g.lineTo(cx + 9, 73);
  g.fill();
  g.strokeStyle = "#e08a3c";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(cx - 8, 98);
  g.quadraticCurveTo(cx - 20, 98, cx - 16, 86);
  g.stroke();
  g.fillStyle = "#222";
  g.fillRect(cx, 77, 2, 2);
  g.fillRect(cx + 5, 77, 2, 2);

  // --- parked motorbike
  const bx = 760;
  g.strokeStyle = "#1b1b1b";
  g.lineWidth = 3;
  for (const wx of [bx, bx + 44]) {
    g.beginPath();
    g.arc(wx, 90, 13, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = "#b71c1c";
  rr(g, bx + 8, 64, 30, 12, 5);
  g.fill();
  g.fillStyle = "#222";
  g.fillRect(bx + 2, 74, 40, 6);
  g.fillRect(bx + 36, 58, 8, 3);
  g.fillStyle = "#e5e5e5";
  g.fillRect(bx + 42, 60, 4, 5);

  return L;
}

/* ---------------------------------------------------------------- POLES */
function wire(g: G, x1: number, y1: number, x2: number, y2: number, sag: number): void {
  g.beginPath();
  g.moveTo(x1, y1);
  g.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + sag * 2, x2, y2);
  g.stroke();
}

export function buildPoles(): Layer {
  const L = makeLayer(TW, 300);
  const g = L.g;
  const r = rng(55);
  const px = (i: number) => 120 + 240 * i;

  // wires first (behind poles); drawn twice so the tile wraps seamlessly
  g.lineCap = "round";
  for (const shift of [0, -TW]) {
    for (let i = 0; i < 4; i++) {
      const a = px(i) + shift, b = px(i + 1) + shift;
      g.strokeStyle = "#17151a";
      g.lineWidth = 1.3;
      for (const ay of [52, 78]) for (const o of [-30, 0, 30]) wire(g, a + o, ay, b + o, ay, 16 + (o === 0 ? 4 : 0));
      // messy bundled cables
      g.lineWidth = 2.6;
      for (let k = 0; k < 3; k++) {
        wire(g, a + 3, 150 + k * 7, b - 3, 152 + k * 8, 26 + r() * 22);
      }
      g.lineWidth = 1.2;
      for (let k = 0; k < 2; k++) {
        g.beginPath();
        g.ellipse(a + 14 + r() * 40, 168 + r() * 20, 14 + r() * 8, 5 + r() * 4, r() * 1.5, 0, Math.PI * 2);
        g.stroke();
      }
    }
  }

  for (let i = 0; i < 4; i++) {
    const x = px(i);
    // pole
    const pg = g.createLinearGradient(x - 4, 0, x + 4, 0);
    pg.addColorStop(0, "#b4b0a8");
    pg.addColorStop(1, "#6d6a64");
    g.fillStyle = pg;
    g.beginPath();
    g.moveTo(x - 3, 40);
    g.lineTo(x + 3, 40);
    g.lineTo(x + 5, 298);
    g.lineTo(x - 5, 298);
    g.closePath();
    g.fill();
    g.strokeStyle = "rgba(30,20,20,0.5)";
    g.lineWidth = 1;
    g.stroke();
    // crossarms + insulators
    for (const ay of [52, 78]) {
      g.fillStyle = "#4a4640";
      g.fillRect(x - 36, ay - 2, 72, 4);
      for (const o of [-30, 0, 30]) {
        g.fillStyle = "#e8e0d0";
        g.fillRect(x + o - 2, ay - 8, 4, 7);
        g.fillStyle = "#8a6a40";
        g.fillRect(x + o - 3, ay - 9, 6, 2);
      }
    }
    // transformer on some poles
    if (i % 2 === 1) {
      const tg = g.createLinearGradient(x - 14, 0, x + 14, 0);
      tg.addColorStop(0, "#9aa3a8");
      tg.addColorStop(1, "#5b6469");
      g.fillStyle = tg;
      rr(g, x - 13, 96, 26, 34, 4);
      g.fill();
      g.strokeStyle = "#2a1a14";
      g.stroke();
      g.fillStyle = "#c8cdd0";
      g.fillRect(x - 10, 92, 4, 5);
      g.fillRect(x + 6, 92, 4, 5);
      g.fillStyle = "#d32f2f";
      g.fillRect(x - 6, 108, 12, 6);
    }
    // posters stuck on the pole
    g.fillStyle = pick(r, ["#fff3b0", "#ffd1dc", "#c8e6ff"]);
    g.fillRect(x - 4, 190, 8, 14);
    g.fillStyle = pick(r, ["#fff", "#ffe0b2"]);
    g.fillRect(x - 4, 215, 8, 11);
  }

  // kite stuck in the wires, tail dangling
  const kx = px(1) + 120, ky = 78 + 24;
  g.fillStyle = "#e53935";
  g.beginPath();
  g.moveTo(kx, ky - 14);
  g.lineTo(kx + 10, ky);
  g.lineTo(kx, ky + 22);
  g.lineTo(kx - 10, ky);
  g.closePath();
  g.fill();
  g.fillStyle = "#fdd835";
  g.beginPath();
  g.moveTo(kx, ky - 14);
  g.lineTo(kx + 10, ky);
  g.lineTo(kx, ky);
  g.closePath();
  g.fill();
  g.strokeStyle = "#2a1a14";
  g.lineWidth = 1;
  g.stroke();
  g.beginPath();
  g.moveTo(kx, ky - 14);
  g.lineTo(kx, ky + 22);
  g.moveTo(kx - 10, ky);
  g.lineTo(kx + 10, ky);
  g.stroke();
  g.beginPath();
  g.moveTo(kx, ky + 22);
  g.bezierCurveTo(kx - 10, ky + 36, kx + 10, ky + 50, kx - 2, ky + 66);
  g.stroke();
  for (let k = 0; k < 3; k++) {
    g.fillStyle = pick(r, ["#e53935", "#fdd835", "#fff"]);
    g.fillRect(kx - 5 + (k % 2) * 4, ky + 34 + k * 11, 5, 3);
  }
  return L;
}

/* ----------------------------------------------------------------- ROAD */
export function buildRoad(): Layer {
  const L = makeLayer(TW, 252);
  const g = L.g;
  const r = rng(77);

  const ag = g.createLinearGradient(0, 0, 0, 252);
  ag.addColorStop(0, "#58524e");
  ag.addColorStop(1, "#2e2b29");
  g.fillStyle = ag;
  g.fillRect(0, 0, TW, 252);
  for (let i = 0; i < 1400; i++) {
    g.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.12)";
    g.fillRect(r() * TW, r() * 252, 1.5 + r() * 2, 1.5 + r() * 2);
  }
  // curb shadow on the road
  const cs = g.createLinearGradient(0, 0, 0, 16);
  cs.addColorStop(0, "rgba(0,0,0,0.4)");
  cs.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = cs;
  g.fillRect(0, 0, TW, 16);
  // patched asphalt
  for (const [px, py, pw, ph] of [[120, 70, 90, 34], [560, 150, 120, 40], [820, 100, 70, 26]]) {
    g.fillStyle = "rgba(20,18,16,0.35)";
    g.fillRect(px, py, pw, ph);
  }
  // tyre tracks
  for (const ty of [100, 160, 215]) {
    g.fillStyle = "rgba(0,0,0,0.12)";
    g.fillRect(0, ty, TW, 5);
    g.fillRect(0, ty + 9, TW, 5);
  }
  // cracks
  g.strokeStyle = "rgba(15,12,10,0.7)";
  g.lineWidth = 1;
  for (let k = 0; k < 7; k++) {
    let cx = 40 + r() * (TW - 120);
    let cy = 30 + r() * 200;
    g.beginPath();
    g.moveTo(cx, cy);
    for (let s = 0; s < 6; s++) {
      cx += 6 + r() * 10;
      cy += (r() - 0.5) * 12;
      g.lineTo(cx, cy);
    }
    g.stroke();
  }
  // potholes
  for (const [px, py] of [[400, 190], [880, 60]]) {
    g.fillStyle = "#1f1c1a";
    g.beginPath();
    g.ellipse(px, py, 22, 7, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "rgba(255,255,255,0.15)";
    g.stroke();
  }
  // puddle reflecting the sunset
  const pg = g.createLinearGradient(300, 0, 380, 0);
  pg.addColorStop(0, "rgba(255,190,120,0.55)");
  pg.addColorStop(1, "rgba(120,140,190,0.45)");
  g.fillStyle = pg;
  g.beginPath();
  g.ellipse(340, 130, 44, 9, 0, 0, Math.PI * 2);
  g.fill();
  // centre dashed line
  g.fillStyle = "#f3eee2";
  for (let x = 0; x < TW; x += 120) g.fillRect(x + 20, 116, 60, 4);
  // zebra crossing
  for (let k = 0; k < 9; k++) {
    g.fillStyle = "rgba(245,240,228,0.85)";
    g.fillRect(620, 40 + k * 20, 80, 8);
  }
  // painted "ধীরে চলুন" (drive slowly) in perspective
  g.save();
  g.translate(780, 218);
  g.scale(1, 0.45);
  g.fillStyle = "rgba(245,240,228,0.8)";
  g.textAlign = "center";
  g.font = `bold 30px ${FONT_BN}`;
  g.fillText("ধীরে চলুন", 0, 0);
  g.restore();
  return L;
}

export function buildAll() {
  return {
    sky: buildSky(),
    clouds: buildClouds(),
    far: buildFar(),
    buildings: buildBuildings(),
    metro: buildMetro(),
    foot: buildFootpath(),
    poles: buildPoles(),
    road: buildRoad(),
  };
}
// Build the heavy pre-rendered layers once and share them between scenes.
let cache: ReturnType<typeof buildAll> | null = null;
export function getLayers() {
  if (!cache) cache = buildAll();
  return cache;
}
