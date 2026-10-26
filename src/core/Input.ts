// Pointer input (mouse + touch) in logical game coordinates.
// A "tap" fires on release if the pointer barely moved; a "swipe" fires if it moved sideways.
export class Input {
  x = 0;
  y = 0;
  down = false;
  private startX = 0;
  private startY = 0;
  private tap: { x: number; y: number } | null = null;
  private swipe: 1 | -1 | 0 = 0;

  constructor(private canvas: HTMLCanvasElement, private width: number, private height: number) {
    canvas.addEventListener("pointerdown", (e) => {
      this.updatePos(e);
      this.down = true;
      this.startX = this.x;
      this.startY = this.y;
    });
    canvas.addEventListener("pointermove", (e) => this.updatePos(e));
    window.addEventListener("pointerup", () => {
      if (!this.down) return;
      this.down = false;
      const dx = this.x - this.startX;
      const dy = this.y - this.startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        this.swipe = dx < 0 ? 1 : -1; // swipe left = next, swipe right = previous
      } else if (Math.hypot(dx, dy) < 14) {
        this.tap = { x: this.startX, y: this.startY };
      }
    });
  }

  private updatePos(e: PointerEvent): void {
    const r = this.canvas.getBoundingClientRect();
    this.x = ((e.clientX - r.left) / r.width) * this.width;
    this.y = ((e.clientY - r.top) / r.height) * this.height;
  }

  // Returns the tap position once, then null.
  consumeTap(): { x: number; y: number } | null {
    const t = this.tap;
    this.tap = null;
    return t;
  }

  // Returns 1 (next), -1 (previous) or 0, once.
  consumeSwipe(): 1 | -1 | 0 {
    const s = this.swipe;
    this.swipe = 0;
    return s;
  }

  // Call in Scene.enter() so old taps don't leak into the new scene.
  clear(): void {
    this.tap = null;
    this.swipe = 0;
  }
}