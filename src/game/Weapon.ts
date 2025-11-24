// src/game/Weapon.ts
import { Castle } from './Castle';

export class Weapon {
  readonly castle: Castle;
  private reloadTime: number;
  private cooldown: number;
  private currentAngleDeg = 45;

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

  setAimAngle(angleDeg: number): void {
    this.currentAngleDeg = angleDeg;
  }

  getMuzzlePosition() {
    return this.castle.getMuzzlePosition();
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const muzzle = this.getMuzzlePosition();

    // Sockel
    const baseHeight = 8;
    const baseWidth = 26;
    ctx.save();
    ctx.fillStyle = '#cbd5f5';
    ctx.fillRect(
      muzzle.x - baseWidth / 2,
      muzzle.y - baseHeight,
      baseWidth,
      baseHeight
    );
    ctx.restore();

    // gedrehtes Rohr
    const angleRad = (this.currentAngleDeg * Math.PI) / 180;
    const direction = this.castle.isLeftSide ? 1 : -1;
    const vx = Math.cos(angleRad) * direction;
    const vy = -Math.sin(angleRad);
    const rotation = Math.atan2(vy, vx);

    const barrelLength = 34;
    const barrelThickness = 6;

    ctx.save();
    ctx.translate(muzzle.x, muzzle.y - baseHeight / 2);
    ctx.rotate(rotation);

    ctx.fillStyle = '#111827';
    ctx.fillRect(0, -barrelThickness / 2, barrelLength, barrelThickness);

    ctx.fillStyle = '#facc15';
    ctx.fillRect(barrelLength - 6, -barrelThickness / 2, 6, barrelThickness);

    ctx.restore();
  }
}
