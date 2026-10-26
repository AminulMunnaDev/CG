// Every screen in the game implements this (like an Android Activity/Fragment).
export interface Scene {
  enter(): void;                       // called when scene becomes active
  exit(): void;                        // called when scene is replaced
  update(dt: number): void;            // dt = seconds since last frame
  draw(ctx: CanvasRenderingContext2D): void;
}
