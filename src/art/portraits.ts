import { drawPerson, drawRickshaw, PersonOpts } from "./vehicles";
import type { RoleId } from "../data/roles";

type G = CanvasRenderingContext2D;

// Draws a large animated character portrait standing on groundY.
export function drawPortrait(g: G, id: RoleId, x: number, groundY: number, t: number): void {
  g.fillStyle = "rgba(0,0,0,0.3)";
  g.beginPath();
  g.ellipse(x, groundY + 2, 72, 10, 0, 0, Math.PI * 2);
  g.fill();

  if (id === "rickshaw") {
    drawRickshaw(g, x, groundY, 1.7, t, 120);
    return;
  }

  const s = 2.9;
  const o: PersonOpts = (
    {
      commuter: { shirt: "#2f6fd6", pants: "#37474f", skin: "#c68642", hair: "#1a1a1a", bag: "#795548" },
      police: { shirt: "#b7a66a", pants: "#4b5a3a", skin: "#b57a43", hair: "#1a1a1a" },
      thief: { shirt: "#263238", pants: "#1c1c1c", skin: "#a9722f", hair: "#111", bag: "#ff4081" },
      uncle: { shirt: "#f4f1e6", pants: "#6a4c93", skin: "#b57a43", hair: "#ddd", topi: true },
    } as Record<string, PersonOpts>
  )[id];

  const speed = id === "thief" ? 1.5 : id === "uncle" ? 0.35 : 1; // run / shuffle / walk
  drawPerson(g, x, groundY, s, t * speed, o);

  // accessories, drawn in the person's local coordinates
  g.save();
  g.translate(x, groundY);
  g.scale(s, s);
  const sw = Math.sin(t * speed * 6); // same swing used by drawPerson
  const handX = sw * 7 + 2;

  if (id === "police") {
    g.fillStyle = "#1f2a44"; // cap
    g.beginPath();
    g.roundRect(-8.5, -78, 17, 7, 3);
    g.fill();
    g.fillRect(2, -72, 11, 2.2); // visor
    g.fillStyle = "#ffd54f";
    g.beginPath();
    g.arc(0, -75, 1.4, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#111"; // belt
    g.fillRect(-8, -37, 16, 3);
    g.fillStyle = "#ffd54f";
    g.fillRect(-1.5, -37, 3, 3);
    g.strokeStyle = "#222"; // baton
    g.lineWidth = 2.6;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(handX, -38);
    g.lineTo(handX + 9, -58);
    g.stroke();
  } else if (id === "thief") {
    g.fillStyle = "#263238"; // hood
    g.beginPath();
    g.arc(0, -68, 10, Math.PI * 0.85, Math.PI * 2.15);
    g.lineTo(9, -58);
    g.lineTo(-9, -58);
    g.closePath();
    g.fill();
    g.fillStyle = "#a9722f"; // face opening
    g.beginPath();
    g.arc(2, -67, 6, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#b71c1c"; // face-covering gamchha
    g.fillRect(-4, -66, 14, 6);
    g.fillStyle = "#111";
    g.fillRect(3, -69, 1.8, 1.8);
    g.fillRect(7, -69, 1.8, 1.8);
  } else if (id === "uncle") {
    g.fillStyle = "#ececec"; // beard
    g.beginPath();
    g.arc(0, -65, 7.6, 0.15, Math.PI - 0.15);
    g.fill();
    g.strokeStyle = "#333"; // spectacles
    g.lineWidth = 0.9;
    g.beginPath();
    g.arc(2.5, -68, 2.4, 0, Math.PI * 2);
    g.arc(7, -68, 2.4, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = "rgba(240,248,255,0.9)"; // tea glass in hand
    g.fillRect(handX - 2, -46, 6, 8);
    g.fillStyle = "#c8741a";
    g.fillRect(handX - 1.5, -43, 5, 4.5);
    g.strokeStyle = "rgba(255,255,255,0.7)";
    g.lineWidth = 0.8;
    g.beginPath();
    g.moveTo(handX + 1 + Math.sin(t * 3) * 1.5, -48);
    g.quadraticCurveTo(handX + 3, -52, handX + 1, -56);
    g.stroke();
  }
  g.restore();
}