// Fixed-cap game loop using requestAnimationFrame.
export class Loop {
  private last = 0;
  private running = false;

  constructor(
    private update: (dt: number) => void,
    private draw: () => void
  ) {}

  start(): void {
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
  }

  private tick = (now: number): void => {
    if (!this.running) return;
    // Cap dt so the game doesn't jump after a tab was in the background.
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this.update(dt);
    this.draw();
    requestAnimationFrame(this.tick);
  };
}
