import type { Scene } from "./Scene";

export class SceneManager {
  private scenes = new Map<string, Scene>();
  private current: Scene | null = null;

  register(name: string, scene: Scene): void {
    this.scenes.set(name, scene);
  }

  switchTo(name: string): void {
    const next = this.scenes.get(name);
    if (!next) throw new Error(`Scene not found: ${name}`);
    this.current?.exit();
    this.current = next;
    next.enter();
  }

  update(dt: number): void {
    this.current?.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.current?.draw(ctx);
  }
}
