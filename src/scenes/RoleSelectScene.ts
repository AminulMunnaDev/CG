import type { Scene } from "../core/Scene";
import type { Input } from "../core/Input";
import { W, H } from "../config";
import { FONT_BN, FONT_TITLE } from "../art/fonts";
import { fitFont, rr, shade, tiled } from "../art/util";
import { getLayers, SPEED, Y } from "../art/scenery";
import { drawPortrait } from "../art/portraits";
import { ROLES, Role } from "../data/roles";

const CARD_W = 330;
const CARD_H = 470;
const CARD_CY = 395;
const BTN = { x: W / 2 - 125, y: 684, w: 250, h: 56 };
const BACK = { x: 14, y: 14, w: 108, h: 38 };

export class RoleSelectScene implements Scene {
  private t = 0;
  private index = 0;
  private pos = 0; // animated carousel position
  private message = "";
  private msgT = 0;

  constructor(
    private input: Input,
    private onBack: () => void,
    private onPick: (role: Role) => void
  ) {}

  enter(): void {
    this.t = 0;
    this.input.clear();
    this.message = "";
    this.pos = this.index;
  }

  exit(): void {}

  private go(d: number): void {
    this.index = Math.max(0, Math.min(ROLES.length - 1, this.index + d));
  }

  private hit(r: { x: number; y: number; w: number; h: number }, px: number, py: number): boolean {
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  }

  update(dt: number): void {
    this.t += dt;
    this.msgT -= dt;

    const sw = this.input.consumeSwipe();
    if (sw) this.go(sw);

    const tap = this.input.consumeTap();
    if (tap) {
      if (this.hit(BACK, tap.x, tap.y)) this.onBack();
      else if (this.hit(BTN, tap.x, tap.y)) {
        const role = ROLES[this.index];
        this.message = `${role.nameBn} — মিশন আসছে Step 3-এ`;
        this.msgT = 3;
        this.onPick(role);
      } else if (tap.y > CARD_CY - CARD_H / 2 && tap.y < CARD_CY + CARD_H / 2) {
        if (tap.x < 56) this.go(-1);
        else if (tap.x > W - 56) this.go(1);
      }
    }

    this.pos += (this.index - this.pos) * Math.min(1, dt * 10);
  }

  draw(g: CanvasRenderingContext2D): void {
    const t = this.t;
    const L = getLayers();

    // slow-moving street behind, darkened so the cards pop
    g.drawImage(L.sky.c, 0, 0, W, H);
    tiled(g, L.clouds, t * SPEED.clouds, Y.clouds);
    tiled(g, L.far, t * SPEED.far, Y.far);
    tiled(g, L.buildings, t * SPEED.buildings * 0.5, Y.buildings);
    tiled(g, L.metro, t * SPEED.metro * 0.5, Y.metro);
    tiled(g, L.foot, t * SPEED.foot * 0.5, Y.foot);
    tiled(g, L.road, t * SPEED.road * 0.5, Y.road);
    tiled(g, L.poles, t * SPEED.poles * 0.5, Y.poles);
    const dim = g.createLinearGradient(0, 0, 0, H);
    dim.addColorStop(0, "rgba(20,8,35,0.72)");
    dim.addColorStop(1, "rgba(10,5,18,0.88)");
    g.fillStyle = dim;
    g.fillRect(0, 0, W, H);

    this.drawHeader(g);

    // cards, farthest first so the active one is on top
    const order = ROLES.map((_, i) => i).sort((a, b) => Math.abs(b - this.pos) - Math.abs(a - this.pos));
    for (const i of order) {
      const d = i - this.pos;
      const ad = Math.min(1, Math.abs(d));
      if (Math.abs(d) > 1.6) continue;
      const sc = 1 - 0.14 * ad;
      const cx = W / 2 + d * CARD_W * 0.84;
      this.drawCard(g, ROLES[i], cx, CARD_CY, sc, 1 - 0.55 * ad, t, Math.abs(d) < 0.5);
    }

    this.drawArrows(g, t);
    this.drawDots(g);
    this.drawButton(g, t);
    this.drawBack(g);

    if (this.msgT > 0) {
      g.textAlign = "center";
      g.textBaseline = "alphabetic";
      g.font = `700 16px ${FONT_BN}`;
      g.fillStyle = "#ffe9a8";
      g.fillText(this.message, W / 2, 775);
    }
  }

  private drawHeader(g: CanvasRenderingContext2D): void {
    const txt = "চরিত্র বেছে নিন";
    g.save();
    g.translate(W / 2, 92);
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    g.lineJoin = "round";
    const size = fitFont(g, txt, W - 120, 52, FONT_TITLE, "normal");
    g.lineWidth = 11;
    g.strokeStyle = "#4a0c1c";
    g.strokeText(txt, 0, 0);
    g.lineWidth = 5;
    g.strokeStyle = "#fff0c0";
    g.strokeText(txt, 0, 0);
    const fg = g.createLinearGradient(0, -size, 0, 6);
    fg.addColorStop(0, "#fff176");
    fg.addColorStop(1, "#ff6d00");
    g.fillStyle = fg;
    g.fillText(txt, 0, 0);
    g.restore();
    g.textAlign = "center";
    g.font = "600 14px sans-serif";
    g.fillStyle = "rgba(255,255,255,0.75)";
    g.fillText("Choose your role  ·  swipe or tap the arrows", W / 2, 122);
  }

  private drawCard(
    g: CanvasRenderingContext2D,
    role: Role,
    cx: number,
    cy: number,
    sc: number,
    alpha: number,
    t: number,
    active: boolean
  ): void {
    g.save();
    g.globalAlpha = alpha;
    g.translate(cx, cy);
    g.scale(sc, sc);
    const hw = CARD_W / 2, hh = CARD_H / 2;

    // drop shadow
    rr(g, -hw + 4, -hh + 10, CARD_W, CARD_H, 26);
    g.fillStyle = "rgba(0,0,0,0.45)";
    g.fill();

    // body + sunburst rays
    g.save();
    rr(g, -hw, -hh, CARD_W, CARD_H, 26);
    g.clip();
    const bg = g.createLinearGradient(0, -hh, 0, hh);
    bg.addColorStop(0, shade(role.color, 0.3));
    bg.addColorStop(1, shade(role.color, -0.55));
    g.fillStyle = bg;
    g.fillRect(-hw, -hh, CARD_W, CARD_H);
    g.save();
    g.translate(0, -60);
    g.rotate(active ? t * 0.15 : 0);
    g.fillStyle = "rgba(255,255,255,0.1)";
    for (let k = 0; k < 16; k++) {
      const a0 = (k / 16) * Math.PI * 2;
      const a1 = a0 + Math.PI / 16;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(Math.cos(a0) * 420, Math.sin(a0) * 420);
      g.lineTo(Math.cos(a1) * 420, Math.sin(a1) * 420);
      g.closePath();
      g.fill();
    }
    g.restore();
    g.fillStyle = "rgba(0,0,0,0.42)"; // info panel
    g.fillRect(-hw, 28, CARD_W, hh - 28 + hh);
    g.restore();

    // rickshaw-art style dotted gold border
    rr(g, -hw, -hh, CARD_W, CARD_H, 26);
    g.lineWidth = 4;
    g.strokeStyle = "#ffd54f";
    g.stroke();
    rr(g, -hw + 9, -hh + 9, CARD_W - 18, CARD_H - 18, 19);
    g.setLineDash([1, 9]);
    g.lineCap = "round";
    g.lineWidth = 3.5;
    g.strokeStyle = "#fff0b0";
    g.stroke();
    g.setLineDash([]);

    // portrait
    drawPortrait(g, role.id, 0, 5, active ? t : 0.3);

    // names
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    fitFont(g, role.nameBn, CARD_W - 40, 30, FONT_BN, "800");
    g.lineWidth = 5;
    g.lineJoin = "round";
    g.strokeStyle = "rgba(0,0,0,0.6)";
    g.strokeText(role.nameBn, 0, 54);
    g.fillStyle = "#fff";
    g.fillText(role.nameBn, 0, 54);
    g.font = "600 14px sans-serif";
    g.fillStyle = "rgba(255,255,255,0.7)";
    g.fillText(role.nameEn, 0, 76);

    // tagline
    g.fillStyle = "#ffe9b0";
    for (let i = 0; i < 2; i++) {
      fitFont(g, role.lines[i], CARD_W - 40, 15, FONT_BN, "600");
      g.fillText(role.lines[i], 0, 104 + i * 21);
    }

    // stats
    const rows: [string, number, string][] = [
      ["গতি", role.stats.speed, "#ffd54f"],
      ["সচেতনতা", role.stats.aware, "#ffd54f"],
      ["ঝুঁকি", role.stats.risk, "#ff5252"],
    ];
    rows.forEach(([label, val, col], i) => {
      const y = 160 + i * 22;
      g.textAlign = "left";
      g.font = `700 14px ${FONT_BN}`;
      g.fillStyle = "#fff";
      g.fillText(label, -hw + 28, y + 4);
      for (let k = 0; k < 5; k++) {
        rr(g, -20 + k * 26, y - 7, 22, 12, 4);
        g.fillStyle = k < val ? col : "rgba(255,255,255,0.18)";
        g.fill();
      }
    });

    // warning badge
    if (role.badge) {
      g.save();
      g.translate(hw - 62, -hh + 34);
      g.rotate(0.2);
      rr(g, -46, -14, 92, 28, 6);
      g.fillStyle = "#d50000";
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = "#fff";
      g.stroke();
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = `800 15px ${FONT_BN}`;
      g.fillStyle = "#fff";
      g.fillText(role.badge, 0, 1);
      g.restore();
    }
    g.restore();
  }

  private drawArrows(g: CanvasRenderingContext2D, t: number): void {
    const bob = Math.sin(t * 4) * 3;
    for (const dir of [-1, 1]) {
      if ((dir < 0 && this.index === 0) || (dir > 0 && this.index === ROLES.length - 1)) continue;
      const x = dir < 0 ? 26 + bob * -1 : W - 26 + bob;
      g.fillStyle = "rgba(0,0,0,0.55)";
      g.beginPath();
      g.arc(x, CARD_CY, 20, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#ffd54f";
      g.lineWidth = 2;
      g.stroke();
      g.fillStyle = "#ffd54f";
      g.beginPath();
      g.moveTo(x + dir * 7, CARD_CY);
      g.lineTo(x - dir * 5, CARD_CY - 10);
      g.lineTo(x - dir * 5, CARD_CY + 10);
      g.closePath();
      g.fill();
    }
  }

  private drawDots(g: CanvasRenderingContext2D): void {
    for (let i = 0; i < ROLES.length; i++) {
      const x = W / 2 + (i - (ROLES.length - 1) / 2) * 22;
      const active = i === this.index;
      g.fillStyle = active ? "#ffd54f" : "rgba(255,255,255,0.35)";
      g.beginPath();
      g.arc(x, 650, active ? 6 : 4, 0, Math.PI * 2);
      g.fill();
    }
  }

  private drawButton(g: CanvasRenderingContext2D, t: number): void {
    const role = ROLES[this.index];
    const pulse = 1 + Math.sin(t * 3.2) * 0.03;
    g.save();
    g.translate(BTN.x + BTN.w / 2, BTN.y + BTN.h / 2);
    g.scale(pulse, pulse);
    rr(g, -BTN.w / 2, -BTN.h / 2 + 4, BTN.w, BTN.h, 28);
    g.fillStyle = "rgba(0,0,0,0.5)";
    g.fill();
    rr(g, -BTN.w / 2, -BTN.h / 2, BTN.w, BTN.h, 28);
    const bg = g.createLinearGradient(0, -BTN.h / 2, 0, BTN.h / 2);
    bg.addColorStop(0, "#ffe066");
    bg.addColorStop(1, shade(role.color, 0.1));
    g.fillStyle = bg;
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = "#5a1a06";
    g.stroke();
    g.textAlign = "center";
    g.textBaseline = "middle";
    fitFont(g, "বাছাই করুন", BTN.w - 60, 26, FONT_BN, "800");
    g.fillStyle = "#3a1004";
    g.fillText("বাছাই করুন", 0, 2);
    g.restore();
  }

  private drawBack(g: CanvasRenderingContext2D): void {
    rr(g, BACK.x, BACK.y, BACK.w, BACK.h, 19);
    g.fillStyle = "rgba(0,0,0,0.55)";
    g.fill();
    g.strokeStyle = "#ffd54f";
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = "#ffd54f";
    g.beginPath();
    g.moveTo(BACK.x + 14, BACK.y + BACK.h / 2);
    g.lineTo(BACK.x + 24, BACK.y + 11);
    g.lineTo(BACK.x + 24, BACK.y + BACK.h - 11);
    g.closePath();
    g.fill();
    g.textAlign = "left";
    g.textBaseline = "middle";
    g.font = `700 15px ${FONT_BN}`;
    g.fillStyle = "#fff";
    g.fillText("ফিরে যান", BACK.x + 32, BACK.y + BACK.h / 2 + 1);
  }
}