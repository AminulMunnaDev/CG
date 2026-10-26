import { FONT_BN } from "./fonts";
import { rr, shade } from "./util";

type G = CanvasRenderingContext2D;
const INK = "#2a1a14";

interface WheelOpts { spokes?: number; solid?: boolean }

export function wheel(g: G, cx: number, cy: number, r: number, rot: number, o: WheelOpts = {}): void {
  g.save();
  g.translate(cx, cy);
  if (o.solid) {
    g.fillStyle = "#1b1b1b";
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#b9bec2";
    g.beginPath();
    g.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    g.fill();
    g.rotate(rot);
    g.fillStyle = "#555";
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      g.beginPath();
      g.arc(Math.cos(a) * r * 0.32, Math.sin(a) * r * 0.32, r * 0.07, 0, Math.PI * 2);
      g.fill();
    }
  } else {
    const n = o.spokes ?? 14;
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.lineWidth = Math.max(2, r * 0.16);
    g.strokeStyle = "#1b1b1b";
    g.stroke();
    g.beginPath();
    g.arc(0, 0, r * 0.82, 0, Math.PI * 2);
    g.lineWidth = 1.2;
    g.strokeStyle = "#d3d7da";
    g.stroke();
    g.rotate(rot);
    g.lineWidth = 0.8;
    g.strokeStyle = "rgba(225,229,233,0.95)";
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      g.beginPath();
      g.moveTo(Math.cos(a) * r * 0.12, Math.sin(a) * r * 0.12);
      g.lineTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8);
      g.stroke();
    }
    g.rotate(-rot);
  }
  g.fillStyle = "#7d8286";
  g.beginPath();
  g.arc(0, 0, r * 0.13, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

// Two-bone IK: returns the knee position for a leg from hip to foot.
function knee(hx: number, hy: number, fx: number, fy: number, l1: number, l2: number, bend: number) {
  let dx = fx - hx, dy = fy - hy;
  let d = Math.hypot(dx, dy);
  const maxd = l1 + l2 - 0.01;
  if (d > maxd) {
    const k = maxd / d;
    dx *= k;
    dy *= k;
    d = maxd;
  }
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const ux = dx / d, uy = dy / d;
  return { kx: hx + ux * a + bend * uy * h, ky: hy + uy * a - bend * ux * h, fx: hx + dx, fy: hy + dy };
}

function shadow(g: G, w: number): void {
  g.fillStyle = "rgba(0,0,0,0.32)";
  g.beginPath();
  g.ellipse(0, 1, w, 6, 0, 0, Math.PI * 2);
  g.fill();
}

/* ------------------------------------------------------------ RICKSHAW */
export function drawRickshaw(g: G, x: number, y: number, s: number, t: number, speed: number): void {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  const rot = (t * speed) / (s * 24);
  shadow(g, 82);

  // wheels
  wheel(g, -38, -24, 24, rot);
  wheel(g, 50, -24, 24, rot);

  // rear mudguard
  g.strokeStyle = "#e8b200";
  g.lineWidth = 3;
  g.beginPath();
  g.arc(-38, -24, 28, Math.PI * 1.02, Math.PI * 1.98);
  g.stroke();

  const bob = Math.sin(t * 9) * 0.9;
  g.translate(0, bob);

  // axle beam & chassis
  g.fillStyle = "#3b2b22";
  g.fillRect(-66, -52, 74, 5);
  g.strokeStyle = "#444";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(-38, -24);
  g.lineTo(-38, -48);
  g.stroke();

  // frame
  g.strokeStyle = "#c62828";
  g.lineWidth = 3.2;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(10, -58);
  g.lineTo(40, -64);
  g.lineTo(16, -26);
  g.lineTo(10, -58);
  g.moveTo(40, -64);
  g.lineTo(50, -24);
  g.stroke();

  // seat cushion + back panel
  g.fillStyle = "#ec407a";
  g.fillRect(-60, -58, 56, 7);
  g.fillStyle = "#d84315";
  g.fillRect(-68, -94, 7, 44);

  // passenger (the commuter)
  g.fillStyle = "#26a69a"; // saree
  rr(g, -52, -84, 22, 30, 8);
  g.fill();
  g.fillStyle = "#e91e63";
  g.fillRect(-46, -84, 5, 30);
  g.fillStyle = "#c68642";
  g.beginPath();
  g.arc(-41, -91, 7, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#1a1a1a";
  g.beginPath();
  g.arc(-44, -93, 7, Math.PI * 0.9, Math.PI * 1.9);
  g.fill();
  g.beginPath();
  g.arc(-50, -91, 3.5, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#6d4c41"; // handbag on lap
  rr(g, -34, -66, 14, 10, 3);
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = 1;
  g.stroke();

  // painted side panel (Taj Mahal motif!)
  rr(g, -66, -72, 72, 22, 3);
  g.fillStyle = "#1aa59a";
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = 1.5;
  g.stroke();
  g.fillStyle = "#ffe082";
  for (let k = -62; k < 4; k += 6) g.fillRect(k, -71, 3, 2);
  g.fillStyle = "#fff3d0"; // dome
  g.beginPath();
  g.arc(-30, -58, 8, Math.PI, 0);
  g.fill();
  g.fillRect(-38, -58, 16, 7);
  g.fillRect(-45, -66, 3, 15);
  g.fillRect(-18, -66, 3, 15);
  g.fillStyle = "#ff7043"; // flowers at both ends
  for (const [fx, fy] of [[-58, -61], [-4, -61], [-58, -53], [-4, -53]]) {
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      g.beginPath();
      g.arc(fx + Math.cos(a) * 2.6, fy + Math.sin(a) * 2.6, 1.8, 0, Math.PI * 2);
      g.fill();
    }
  }
  g.fillStyle = "#ffeb3b";
  for (const [fx, fy] of [[-58, -61], [-4, -61], [-58, -53], [-4, -53]]) {
    g.beginPath();
    g.arc(fx, fy, 1.5, 0, Math.PI * 2);
    g.fill();
  }

  // folded hood with stripes + fringe
  g.save();
  g.beginPath();
  g.moveTo(-68, -93);
  g.bezierCurveTo(-66, -130, -14, -130, 8, -88);
  g.lineTo(-68, -93);
  g.closePath();
  g.clip();
  const cols = ["#e53935", "#fdd835", "#1e88e5", "#43a047", "#fb8c00"];
  for (let k = 0; k < 14; k++) {
    g.fillStyle = cols[k % cols.length];
    g.fillRect(-70 + k * 6, -135, 6, 50);
  }
  g.restore();
  g.strokeStyle = INK;
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(-68, -93);
  g.bezierCurveTo(-66, -130, -14, -130, 8, -88);
  g.lineTo(-68, -93);
  g.stroke();
  g.strokeStyle = "rgba(0,0,0,0.3)";
  g.lineWidth = 1;
  for (const [ex, ey] of [[-50, -114], [-34, -120], [-18, -112]]) {
    g.beginPath();
    g.moveTo(-68, -93);
    g.quadraticCurveTo(ex, ey, 8, -88);
    g.stroke();
  }
  for (let k = -64; k < 8; k += 5) {
    g.fillStyle = k % 10 ? "#ffd54f" : "#ef5350";
    g.beginPath();
    g.arc(k, -90 + (k + 68) * 0.07 - 0, 1.8, 0, Math.PI * 2);
    g.fill();
  }

  // handlebar, flowers, tassels, bell
  g.strokeStyle = "#444";
  g.lineWidth = 2.5;
  g.beginPath();
  g.moveTo(40, -64);
  g.lineTo(37, -74);
  g.lineTo(44, -75);
  g.stroke();
  for (const [fx, fy, c] of [[36, -78, "#ff4081"], [41, -80, "#ffd740"], [45, -77, "#69f0ae"]] as [number, number, string][]) {
    g.fillStyle = c;
    g.beginPath();
    g.arc(fx, fy, 3, 0, Math.PI * 2);
    g.fill();
  }
  for (let k = 0; k < 4; k++) {
    const tx = 38 + k * 2.5;
    g.strokeStyle = k % 2 ? "#e53935" : "#fdd835";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(tx, -72);
    g.lineTo(tx + Math.sin(t * 8 + k) * 1.5, -56 + k);
    g.stroke();
    g.fillStyle = k % 2 ? "#e53935" : "#fdd835";
    g.beginPath();
    g.arc(tx + Math.sin(t * 8 + k) * 1.5, -55 + k, 1.8, 0, Math.PI * 2);
    g.fill();
  }

  // driver: pedaling legs (IK)
  const ang = t * 8;
  const hipX = 8, hipY = -62;
  const legCol = "#2f3f66";
  for (const ph of [0, Math.PI]) {
    const fx = 16 + Math.cos(ang + ph) * 8;
    const fy = -26 + Math.sin(ang + ph) * 8;
    const k = knee(hipX, hipY, fx, fy, 24, 26, 1);
    g.strokeStyle = ph ? shade(legCol, -0.25) : legCol;
    g.lineWidth = 7;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(hipX, hipY);
    g.lineTo(k.kx, k.ky);
    g.lineTo(k.fx, k.fy);
    g.stroke();
    g.fillStyle = "#222";
    g.fillRect(k.fx - 2, k.fy - 1, 8, 3.5);
  }
  // saddle
  g.fillStyle = "#222";
  rr(g, 2, -64, 14, 4, 2);
  g.fill();
  // torso, arms, head
  g.fillStyle = "#43a047";
  g.beginPath();
  g.moveTo(5, -62);
  g.lineTo(17, -92);
  g.lineTo(26, -88);
  g.lineTo(16, -60);
  g.closePath();
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = 1.2;
  g.stroke();
  g.strokeStyle = "#a9722f";
  g.lineWidth = 4.5;
  g.beginPath();
  g.moveTo(22, -88);
  g.lineTo(32, -81);
  g.lineTo(38, -74);
  g.stroke();
  g.fillStyle = "#a9722f";
  g.beginPath();
  g.arc(24, -99, 7, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = 1;
  g.stroke();
  g.fillStyle = "#e53935"; // gamchha head wrap
  g.beginPath();
  g.arc(23.5, -101, 7.4, Math.PI * 0.95, Math.PI * 2.05);
  g.fill();
  g.fillStyle = "#fff";
  g.fillRect(17, -102, 14, 1.5);
  g.fillStyle = "#222";
  g.fillRect(28, -100, 1.6, 1.6);
  // lungi
  g.fillStyle = "rgba(255,255,255,0.0)";
  // reflector
  g.fillStyle = "#ff1744";
  g.fillRect(-71, -64, 3, 9);

  g.restore();
}

/* ----------------------------------------------------------------- CNG */
export function drawCNG(g: G, x: number, y: number, s: number, t: number, speed: number): void {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  const rot = (t * speed) / (s * 15);
  shadow(g, 62);
  const bob = Math.sin(t * 22) * 0.6;
  wheel(g, -34, -15, 15, rot, { solid: true });
  wheel(g, 42, -15, 15, rot, { solid: true });
  g.translate(0, bob);

  // body
  g.beginPath();
  g.moveTo(-58, -24);
  g.lineTo(-58, -52);
  g.quadraticCurveTo(-58, -90, -30, -92);
  g.lineTo(10, -92);
  g.quadraticCurveTo(24, -90, 28, -66);
  g.lineTo(58, -48);
  g.quadraticCurveTo(66, -44, 66, -34);
  g.lineTo(66, -24);
  g.closePath();
  const bg = g.createLinearGradient(0, -92, 0, -24);
  bg.addColorStop(0, "#43b05c");
  bg.addColorStop(1, "#1f7a36");
  g.fillStyle = bg;
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = 1.6;
  g.stroke();
  // roof highlight
  g.fillStyle = "rgba(255,255,255,0.28)";
  g.fillRect(-48, -90, 56, 3);
  // metal cage window
  rr(g, -52, -80, 54, 26, 3);
  g.fillStyle = "#1e2b20";
  g.fill();
  g.strokeStyle = "#cfd8dc";
  g.lineWidth = 1;
  for (let k = -48; k < 0; k += 6) {
    g.beginPath();
    g.moveTo(k, -80);
    g.lineTo(k, -54);
    g.stroke();
  }
  for (let k = -76; k < -54; k += 6) {
    g.beginPath();
    g.moveTo(-52, k);
    g.lineTo(2, k);
    g.stroke();
  }
  // driver + windshield
  g.fillStyle = "#cfe9f5";
  g.beginPath();
  g.moveTo(8, -84);
  g.lineTo(24, -66);
  g.lineTo(40, -52);
  g.lineTo(8, -52);
  g.closePath();
  g.fill();
  g.strokeStyle = INK;
  g.stroke();
  g.fillStyle = "#37474f";
  g.beginPath();
  g.arc(20, -68, 5.5, 0, Math.PI * 2);
  g.fill();
  g.fillRect(14, -63, 12, 11);
  // black stripe + plate
  g.fillStyle = "#101010";
  g.fillRect(-58, -40, 124, 5);
  g.fillStyle = "#ffeb3b";
  g.fillRect(-18, -34, 22, 8);
  g.fillStyle = "#222";
  g.fillRect(-15, -32, 16, 1.5);
  g.fillRect(-15, -29, 10, 1.5);
  // headlight + glow
  const hg = g.createRadialGradient(64, -34, 1, 64, -34, 26);
  hg.addColorStop(0, "rgba(255,240,170,0.9)");
  hg.addColorStop(1, "rgba(255,240,170,0)");
  g.fillStyle = hg;
  g.beginPath();
  g.arc(64, -34, 26, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#fff6c2";
  g.beginPath();
  g.arc(63, -34, 4.5, 0, Math.PI * 2);
  g.fill();
  // mudguards
  g.fillStyle = "#17602b";
  g.beginPath();
  g.arc(42, -15, 19, Math.PI, 0);
  g.lineTo(23, -24);
  g.fill();
  g.restore();
}

/* ---------------------------------------------------------------- BIKE */
export function drawBike(g: G, x: number, y: number, s: number, t: number, speed: number): void {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  const rot = (t * speed) / (s * 17);
  shadow(g, 48);
  wheel(g, -30, -17, 17, rot, { spokes: 10 });
  wheel(g, 32, -17, 17, rot, { spokes: 10 });
  g.translate(0, Math.sin(t * 30) * 0.5);

  // headlight beam
  const hg = g.createRadialGradient(46, -42, 1, 46, -42, 40);
  hg.addColorStop(0, "rgba(255,245,190,0.85)");
  hg.addColorStop(1, "rgba(255,245,190,0)");
  g.fillStyle = hg;
  g.beginPath();
  g.arc(46, -42, 40, 0, Math.PI * 2);
  g.fill();

  // body
  g.fillStyle = "#222";
  g.beginPath();
  g.moveTo(-26, -20);
  g.lineTo(-8, -44);
  g.lineTo(26, -40);
  g.lineTo(30, -17);
  g.lineTo(6, -24);
  g.closePath();
  g.fill();
  g.fillStyle = "#c62828"; // tank
  rr(g, 2, -56, 30, 14, 6);
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = 1.3;
  g.stroke();
  g.fillStyle = "#111"; // seat
  rr(g, -30, -48, 38, 7, 3);
  g.fill();
  // fork + handlebar + headlight
  g.strokeStyle = "#999";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(32, -17);
  g.lineTo(38, -54);
  g.lineTo(32, -60);
  g.stroke();
  g.fillStyle = "#fff6c2";
  g.beginPath();
  g.arc(44, -48, 5, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = 1;
  g.stroke();
  // exhaust
  g.fillStyle = "#777";
  g.fillRect(-36, -24, 22, 5);

  // pillion rider (hooded, mask) + rider (full-face helmet)
  g.fillStyle = "#37474f";
  rr(g, -26, -84, 14, 38, 6);
  g.fill();
  g.fillStyle = "#cfa37a";
  g.beginPath();
  g.arc(-18, -92, 6.5, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#222";
  g.beginPath();
  g.arc(-19, -94, 7, Math.PI * 0.95, Math.PI * 2);
  g.fill();
  g.fillStyle = "#b71c1c"; // face mask
  g.fillRect(-14, -91, 8, 5);
  g.fillStyle = "#fff";
  g.fillRect(-10, -94, 2, 2);
  g.strokeStyle = "#37474f";
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(-14, -78);
  g.lineTo(-4, -72); // sneaky reaching arm
  g.lineTo(6, -76);
  g.stroke();

  g.fillStyle = "#263238";
  g.beginPath();
  g.moveTo(-8, -46);
  g.lineTo(2, -88);
  g.lineTo(16, -86);
  g.lineTo(12, -48);
  g.closePath();
  g.fill();
  g.strokeStyle = "#263238";
  g.lineWidth = 4.5;
  g.beginPath();
  g.moveTo(10, -80);
  g.lineTo(24, -68);
  g.lineTo(34, -60);
  g.stroke();
  g.fillStyle = "#1b1b1b"; // helmet
  g.beginPath();
  g.arc(10, -97, 9, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#7fd3ff";
  g.beginPath();
  g.moveTo(11, -100);
  g.lineTo(19, -99);
  g.lineTo(18, -94);
  g.lineTo(11, -94);
  g.fill();
  g.strokeStyle = "#263238";
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(0, -48);
  g.lineTo(14, -36);
  g.lineTo(12, -22);
  g.stroke();
  g.restore();
}

/* ----------------------------------------------------------------- BUS */
export function drawBus(g: G, x: number, y: number, s: number, t: number, speed: number): void {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  const rot = (t * speed) / (s * 17);
  shadow(g, 108);
  wheel(g, -62, -17, 17, rot, { solid: true });
  wheel(g, 52, -17, 17, rot, { solid: true });
  g.translate(0, Math.sin(t * 17) * 0.8);

  // luggage on the roof
  g.fillStyle = "#8d6e63";
  rr(g, -60, -104, 36, 14, 4);
  g.fill();
  g.fillStyle = "#cfd8dc";
  rr(g, -18, -102, 26, 12, 4);
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = 1;
  g.stroke();

  // body
  g.beginPath();
  g.moveTo(-100, -24);
  g.lineTo(-100, -90);
  g.lineTo(88, -90);
  g.quadraticCurveTo(100, -88, 102, -70);
  g.lineTo(104, -24);
  g.closePath();
  const bg = g.createLinearGradient(0, -90, 0, -24);
  bg.addColorStop(0, "#f2b631");
  bg.addColorStop(1, "#d98d1e");
  g.fillStyle = bg;
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = 1.8;
  g.stroke();
  // stripes
  g.fillStyle = "#c62828";
  g.fillRect(-100, -48, 204, 7);
  g.fillStyle = "#1b8a3c";
  g.fillRect(-100, -41, 204, 5);
  // windows with passengers
  for (let k = 0; k < 7; k++) {
    const wx = -94 + k * 26;
    rr(g, wx, -82, 22, 24, 3);
    g.fillStyle = "#274155";
    g.fill();
    g.strokeStyle = INK;
    g.lineWidth = 1;
    g.stroke();
    if (k % 3 !== 2) {
      g.fillStyle = ["#e0a37a", "#c68642", "#8d5524"][k % 3];
      g.beginPath();
      g.arc(wx + 11, -70, 5, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = ["#e53935", "#1e88e5", "#fdd835"][k % 3];
      g.fillRect(wx + 5, -65, 12, 7);
    }
  }
  // dents + rust
  g.strokeStyle = "rgba(60,30,10,0.4)";
  g.lineWidth = 1;
  for (const [dx, dy] of [[-70, -30], [10, -33], [60, -28]]) {
    g.beginPath();
    g.moveTo(dx, dy);
    g.lineTo(dx + 12, dy + 2);
    g.stroke();
  }
  // name text
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `800 11px ${FONT_BN}`;
  g.fillText("সিটিং সার্ভিস", -10, -29);
  g.textBaseline = "alphabetic";
  // door + hanging helper
  g.fillStyle = "#22303a";
  g.fillRect(74, -82, 22, 54);
  g.fillStyle = "#e0a37a";
  g.beginPath();
  g.arc(86, -70, 5, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#3f51b5";
  g.fillRect(80, -65, 12, 18);
  // headlight + bumper
  g.fillStyle = "#fff6c2";
  g.beginPath();
  g.arc(100, -34, 4, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#555";
  g.fillRect(-103, -28, 8, 6);
  g.fillRect(96, -28, 10, 6);
  g.restore();
}

/* -------------------------------------------------------------- PERSON */
export interface PersonOpts {
  shirt: string;
  pants: string;
  skin: string;
  hair: string;
  female?: boolean;
  bag?: string;
  topi?: boolean;
  phone?: boolean;
  phase?: number;
  dir?: 1 | -1;
}

export function drawPerson(g: G, x: number, y: number, s: number, t: number, o: PersonOpts): void {
  g.save();
  g.translate(x, y);
  g.scale(s * (o.dir ?? 1), s);
  const ph = t * 6 + (o.phase ?? 0);
  const sw = Math.sin(ph);
  const hip = { x: 0, y: -30 };

  // legs
  g.lineCap = "round";
  for (const side of [-1, 1]) {
    const a = sw * 0.55 * side;
    const lift = Math.max(0, Math.cos(ph) * side) * 3;
    const fx = Math.sin(a) * 30;
    const fy = -Math.cos(a) * 30 + 30 - lift;
    g.strokeStyle = side > 0 ? o.pants : shade(o.pants, -0.2);
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(hip.x, hip.y);
    g.lineTo(fx, fy - 0);
    g.stroke();
    g.fillStyle = "#1c1c1c";
    g.fillRect(fx - 2, fy - 2, 8, 4);
  }

  // back arm
  g.strokeStyle = shade(o.skin, -0.15);
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(0, -54);
  g.lineTo(-sw * 7, -38);
  g.stroke();

  // torso
  g.fillStyle = o.shirt;
  if (o.female) {
    g.beginPath();
    g.moveTo(-8, -58);
    g.lineTo(8, -58);
    g.lineTo(11, -20);
    g.lineTo(-11, -20);
    g.closePath();
    g.fill();
    g.fillStyle = shade(o.shirt, 0.35);
    g.fillRect(-9, -40, 18, 4);
  } else {
    rr(g, -8, -58, 16, 29, 5);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.18)";
    g.fillRect(-8, -58, 4, 29);
  }
  g.strokeStyle = INK;
  g.lineWidth = 1;
  if (!o.female) {
    rr(g, -8, -58, 16, 29, 5);
    g.stroke();
  }

  // head
  g.fillStyle = o.skin;
  g.beginPath();
  g.arc(0, -67, 8, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  g.fillStyle = o.hair;
  if (o.topi) {
    g.fillStyle = "#f7f3e8";
    rr(g, -7, -77, 14, 6, 3);
    g.fill();
    g.stroke();
  } else {
    g.beginPath();
    g.arc(0, -68, 8.4, Math.PI * 1.05, Math.PI * 1.95);
    g.fill();
    if (o.female) {
      g.beginPath();
      g.arc(-7, -64, 4, 0, Math.PI * 2);
      g.fill();
    }
  }
  g.fillStyle = "#222";
  g.fillRect(3, -68, 1.6, 1.6);

  // front arm (+ phone or bag)
  g.strokeStyle = o.skin;
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(1, -54);
  if (o.phone) {
    g.lineTo(8, -48);
    g.lineTo(6, -64);
    g.stroke();
    g.fillStyle = "#111";
    g.fillRect(6, -70, 3, 6);
  } else {
    g.lineTo(sw * 7 + 2, -38);
    g.stroke();
    if (o.bag) {
      g.fillStyle = o.bag;
      rr(g, sw * 7 - 2, -38, 12, 10, 3);
      g.fill();
      g.strokeStyle = INK;
      g.lineWidth = 1;
      g.stroke();
    }
  }
  g.restore();
}
