import { W, H, SCALE } from "./config";
import { Loop } from "./core/Loop";
import { SceneManager } from "./core/SceneManager";
import { Input } from "./core/Input";
import { loadFonts } from "./art/fonts";
import { MenuScene } from "./scenes/MenuScene";
import { RoleSelectScene } from "./scenes/RoleSelectScene";
import { state } from "./core/GameState";

const canvas = document.getElementById("game") as HTMLCanvasElement;
// Internal resolution is SCALE x bigger than the logical size for crisp art.
canvas.width = W * SCALE;
canvas.height = H * SCALE;

// Fit the canvas to the screen while keeping the aspect ratio.
function resize(): void {
  const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  canvas.style.width = `${W * scale}px`;
  canvas.style.height = `${H * scale}px`;
}
window.addEventListener("resize", resize);
resize();

async function start(): Promise<void> {
  await loadFonts(); // signboards are pre-rendered, so fonts must be ready first

  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);
  const input = new Input(canvas, W, H);
  const scenes = new SceneManager();

  scenes.register("menu", new MenuScene(input, () => scenes.switchTo("roles")));
  scenes.register(
    "roles",
    new RoleSelectScene(
      input,
      () => scenes.switchTo("menu"),
      (role) => {
        state.role = role.id; // Step 3 will switch to the role's mini-game here
      }
    )
  );
  scenes.switchTo("menu");

  const loop = new Loop(
    (dt) => scenes.update(dt),
    () => {
      ctx.clearRect(0, 0, W, H);
      scenes.draw(ctx);
    }
  );
  loop.start();
}

start();