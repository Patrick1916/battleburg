// src/game/Weapon.ts
import { Castle } from './Castle';
import type { Vec2 } from './types';

export class Weapon {
  readonly castle: Castle;
  private reloadTime: number;
  private cooldown: number;

  constructor(castle: Castle, reloadTimeSeconds = 2) {
    this.castle = castle;
    this.reloadTime = reloadTimeSeconds;
    this.cooldown = 0;
  }

  update(dt: number): void {
    if (this.cooldown > 0) {
      this.cooldown = Math.max(0, this.cooldown - dt);
    }
  }

  canFire(): boolean {
    return this.cooldown <= 0;
  }

  markFired(): void {
    this.cooldown = this.reloadTime;
  }

  getMuzzlePosition(): Vec2 {
    return this.castle.getMuzzlePosition();
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const muzzle = this.getMuzzlePosition();
    const baseHeight = 8;
    const baseWidth = 24;

    ctx.save();
    ctx.fillStyle = '#bbbbbb';
    ctx.fillRect(
      muzzle.x - baseWidth / 2,
      muzzle.y - baseHeight,
      baseWidth,
      baseHeight
    );
    ctx.restore();
  }
}
