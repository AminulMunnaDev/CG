import type { Scene } from "../core/Scene";
import type { Input } from "../core/Input";
import { W, H } from "../config";
import { FONT_BN, FONT_TITLE } from "../art/fonts";
import { fitFont, tiled, rr } from "../art/util";
import { getLayers, drawTrain, SPEED, Y } from "../art/scenery";

import { drawBike, drawBus, drawCNG, drawPerson, drawRickshaw, PersonOpts } from "../art/vehicles";

type Kind = "rickshaw" | "cng" | "bike" | "bus";
interface Vehicle {
  kind: Kind;
  x: number;
  y: number;
  s: number;
  ground: number; // ground speed (px/s) -> wheel spin
  rel: number;    // speed relative to the screen (px/s)
}
interface Walker { x: number; y: number; s: number; v: number; o: PersonOpts }
interface Puff { x: number; y: number; r: number; life: number }

export class MenuScene implements Scene {
  private t = 0;
  private message = "";
  private msgT = 0;
  private L = getLayers();
  private puffs: Puff[] = [];
  private puffTimer = 0;

  private vehicles: Vehicle[] = [
    { kind: "bus", x: 330, y: 626, s: 0.82, ground: 150, rel: -70 },
    { kind: "cng", x: -120, y: 668, s: 0.95, ground: 330, rel: 100 },
    { kind: "bike", x: -600, y: 700, s: 1.0, ground: 560, rel: 330 },
    { kind: "rickshaw", x: 200, y: 722, s: 1.3, ground: 230, rel: 0 },
  ];

  private walkers: Walker[] = [
    { x: 60, y: 536, s: 0.82, v: -120, o: { shirt: "#3f51b5", pants: "#37474f", skin: "#c68642", hair: "#1a1a1a", bag: "#795548", phase: 0 } },
    { x: 190, y: 532, s: 0.78, v: -190, o: { shirt: "#e91e63", pants: "#6a1b9a", skin: "#a9722f", hair: "#1a1a1a", female: true, phase: 1.5 } },
    { x: 300, y: 538, s: 0.84, v: -135, o: { shirt: "#ffffff", pants: "#2e7d32", skin: "#b57a43", hair: "#1a1a1a", topi: true, phase: 3 } },
    { x: 420, y: 534, s: 0.8, v: -200, o: { shirt: "#ff9800", pants: "#263238", skin: "#d39b68", hair: "#222", phone: true, phase: 4.2 } },
  ];

constructor(private input: Input, private onStart: () => void) {}

 enter(): void {
  this.t = 0;
  this.message = "";
  this.input.clear();
}

  exit(): void {}

  update(dt: number): void {
    this.t += dt;
    this.msgT -= dt;

  if (this.input.consumeTap()) this.onStart();

    for (const v of this.vehicles) {
      v.x += v.rel * dt;
      if (v.rel > 0 && v.x > W + 260) v.x = -260 - Math.random() * (v.kind === "bike" ? 900 : 300);
      if (v.rel < 0 && v.x < -300) v.x = W + 260 + Math.random() * 200;
    }
    for (const w of this.walkers) {
      w.x += w.v * dt;
      if (w.x < -40) w.x += W + 120;
    }

    // exhaust puffs from the bus and CNG
    this.puffTimer -= dt;
    if (this.puffTimer <= 0) {
      this.puffTimer = 0.14;
      for (const v of this.vehicles) {
        if (v.kind === "bus") this.puffs.push({ x: v.x - 104 * v.s, y: v.y - 22 * v.s, r: 4, life: 1 });
        if (v.kind === "cng") this.puffs.push({ x: v.x - 60 * v.s, y: v.y - 24 * v.s, r: 3, life: 0.8 });
      }
    }
    for (const p of this.puffs) {
      p.life -= dt * 0.8;
      p.r += dt * 14;
      p.x -= (60 + 40 * (1 - p.life)) * dt * -0.5 + dt * 30;
      p.y -= dt * 12;
    }
    this.puffs = this.puffs.filter((p) => p.life > 0);
  }

  draw(g: CanvasRenderingContext2D): void {
    const t = this.t;
    const L = this.L;

    g.drawImage(L.sky.c, 0, 0, W, H);
    tiled(g, L.clouds, t * SPEED.clouds, Y.clouds);
    this.drawBirds(g, t);
    tiled(g, L.far, t * SPEED.far, Y.far);
    tiled(g, L.buildings, t * SPEED.buildings, Y.buildings);
    tiled(g, L.metro, t * SPEED.metro, Y.metro);

    // metro train crosses every ~10s
    const trainX = -520 + ((t * 190) % 1900);
    g.save();
    g.translate(0, Y.metro);
    drawTrain(g, trainX);
    g.restore();

    tiled(g, L.foot, t * SPEED.foot, Y.foot);
    for (const w of this.walkers) drawPerson(g, w.x, w.y, w.s, t, w.o);

    tiled(g, L.road, t * SPEED.road, Y.road);
    tiled(g, L.poles, t * SPEED.poles, Y.poles);

    // vehicles sorted by lane depth
    for (const v of [...this.vehicles].sort((a, b) => a.y - b.y)) {
      switch (v.kind) {
        case "bus": drawBus(g, v.x, v.y, v.s, t, v.ground); break;
        case "cng": drawCNG(g, v.x, v.y, v.s, t, v.ground); break;
        case "bike": drawBike(g, v.x, v.y, v.s, t, v.ground); break;
        case "rickshaw": drawRickshaw(g, v.x, v.y, v.s, t, v.ground); break;
      }
    }

    for (const p of this.puffs) {
      g.fillStyle = `rgba(70,66,64,${Math.max(0, p.life) * 0.35})`;
      g.beginPath();
      g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      g.fill();
    }

    this.drawAtmosphere(g, t);
    this.drawTitle(g, t);
    this.drawButton(g, t);
  }

  private drawBirds(g: CanvasRenderingContext2D, t: number): void {
    g.strokeStyle = "rgba(50,25,45,0.8)";
    g.lineWidth = 1.6;
    g.lineCap = "round";
    for (let i = 0; i < 5; i++) {
      const x = ((t * (22 + i * 3) + i * 110) % (W + 120)) - 60;
      const y = 214 + i * 12 + Math.sin(t * 1.5 + i) * 8;
      const f = Math.sin(t * 9 + i * 2) * 4;
      g.beginPath();
      g.moveTo(x - 7, y - f);
      g.quadraticCurveTo(x - 3, y - 3, x, y);
      g.quadraticCurveTo(x + 3, y - 3, x + 7, y - f);
      g.stroke();
    }
  }

  private drawAtmosphere(g: CanvasRenderingContext2D, t: number): void {
    // warm sunset light from the right
    const lg = g.createLinearGradient(W, 200, 0, 700);
    lg.addColorStop(0, "rgba(255,170,90,0.22)");
    lg.addColorStop(1, "rgba(80,40,120,0.12)");
    g.fillStyle = lg;
    g.fillRect(0, 0, W, H);

    // floating dust motes
    for (let i = 0; i < 26; i++) {
      const x = (i * 97 + t * (14 + (i % 5) * 4)) % (W + 20);
      const y = 380 + ((i * 53) % 330) + Math.sin(t * 1.3 + i) * 6;
      g.fillStyle = `rgba(255,230,190,${0.15 + (i % 4) * 0.06})`;
      g.beginPath();
      g.arc(x, y, 1 + (i % 3) * 0.6, 0, Math.PI * 2);
      g.fill();
    }

    // vignette + dark bottom for UI legibility
    const vg = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.78);
    vg.addColorStop(0, "rgba(20,5,30,0)");
    vg.addColorStop(1, "rgba(20,5,30,0.5)");
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);
    const bg = g.createLinearGradient(0, 690, 0, H);
    bg.addColorStop(0, "rgba(10,5,15,0)");
    bg.addColorStop(1, "rgba(10,5,15,0.65)");
    g.fillStyle = bg;
    g.fillRect(0, 690, W, H - 690);
  }

  private drawTitle(g: CanvasRenderingContext2D, t: number): void {
    const txt = "ছিনতাই রাস্তা";
    g.save();
    g.translate(W / 2, 122 + Math.sin(t * 1.6) * 3);
    g.rotate(-0.025);
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    g.lineJoin = "round";
    const size = fitFont(g, txt, W - 70, 74, FONT_TITLE, "normal");
    g.fillStyle = "rgba(30,5,15,0.55)";
    g.fillText(txt, 4, 7);
    g.lineWidth = 15;
    g.strokeStyle = "#4a0c1c";
    g.strokeText(txt, 0, 0);
    g.lineWidth = 7;
    g.strokeStyle = "#fff0c0";
    g.strokeText(txt, 0, 0);
    const fg = g.createLinearGradient(0, -size, 0, 6);
    fg.addColorStop(0, "#fff176");
    fg.addColorStop(1, "#ff6d00");
    g.fillStyle = fg;
    g.fillText(txt, 0, 0);
    g.restore();

    // ribbon subtitle
    const rx = W / 2, ry = 168;
    g.save();
    g.translate(rx, ry);
    g.rotate(-0.025);
    g.fillStyle = "#8e1b1b";
    g.beginPath();
    g.moveTo(-142, -6);
    g.lineTo(-118, -6);
    g.lineTo(-118, 22);
    g.lineTo(-142, 22);
    g.lineTo(-132, 8);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(142, -6);
    g.lineTo(118, -6);
    g.lineTo(118, 22);
    g.lineTo(142, 22);
    g.lineTo(132, 8);
    g.closePath();
    g.fill();
    rr(g, -120, -12, 240, 30, 5);
    g.fillStyle = "#c62828";
    g.fill();
    g.strokeStyle = "#ffd54f";
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = "#ffd54f";
    for (const dx of [-108, 108]) {
      g.beginPath();
      g.arc(dx, 3, 3, 0, Math.PI * 2);
      g.fill();
    }
    g.textAlign = "center";
    g.textBaseline = "middle";
    fitFont(g, "মোহাম্মদপুর সংস্করণ", 200, 20, FONT_BN, "800");
    g.fillStyle = "#ffe9a8";
    g.fillText("মোহাম্মদপুর সংস্করণ", 0, 4);
    g.restore();
  }

  private drawButton(g: CanvasRenderingContext2D, t: number): void {
    const cx = W / 2, cy = 754;
    const pulse = 1 + Math.sin(t * 3.2) * 0.03;
    g.save();
    g.translate(cx, cy);
    g.scale(pulse, pulse);
    rr(g, -125, -24, 250, 56, 28);
    g.fillStyle = "rgba(0,0,0,0.45)";
    g.fill();
    rr(g, -125, -28, 250, 56, 28);
    const bg = g.createLinearGradient(0, -28, 0, 28);
    bg.addColorStop(0, "#ffe066");
    bg.addColorStop(1, "#ff8f1f");
    g.fillStyle = bg;
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = "#7a2e0e";
    g.stroke();
    g.fillStyle = "rgba(255,255,255,0.35)";
    rr(g, -112, -24, 224, 12, 6);
    g.fill();
    g.textAlign = "center";
    g.textBaseline = "middle";
    fitFont(g, "খেলা শুরু করুন", 190, 26, FONT_BN, "800");
    g.fillStyle = "#5a1a06";
    g.fillText("খেলা শুরু করুন", 0, 2);
    g.restore();

    if (this.msgT > 0) {
      g.textAlign = "center";
      g.textBaseline = "alphabetic";
      g.font = `600 15px ${FONT_BN}`;
      g.fillStyle = "#fff";
      g.fillText(this.message, W / 2, 706);
    }
  }
}
