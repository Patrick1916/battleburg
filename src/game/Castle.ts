// src/game/Castle.ts
import type { Vec2 } from './types';

export class Castle {
  readonly position: Vec2; // Basiszentrum (x), Bodenhöhe (y)
  readonly width: number;
  readonly height: number;
  readonly maxHp: number;
  hp: number;
  readonly isLeftSide: boolean;
  readonly baseColor: string;

  constructor(
    position: Vec2,
    width: number,
    height: number,
    maxHp: number,
    isLeftSide: boolean,
    baseColor: string
  ) {
    this.position = position;
    this.width = width;
    this.height = height;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.isLeftSide = isLeftSide;
    this.baseColor = baseColor;
  }

  applyDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }

  private getCurrentHeight(): number {
    const ratio = this.hp / this.maxHp;
    const clampedRatio = Math.max(0.2, ratio); // Burg wird nicht komplett unsichtbar
    return this.height * clampedRatio;
  }

  getBounds(): { left: number; right: number; top: number; bottom: number } {
    const h = this.getCurrentHeight();
    const left = this.position.x - this.width / 2;
    const right = this.position.x + this.width / 2;
    const bottom = this.position.y;
    const top = bottom - h;
    return { left, right, top, bottom };
  }

  getMuzzlePosition(): Vec2 {
    const bounds = this.getBounds();
    return {
      x: this.position.x,
      y: bounds.top
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const bounds = this.getBounds();
    const hpRatio = this.hp / this.maxHp;

    ctx.save();
    ctx.fillStyle = this.baseColor;
    ctx.fillRect(
      bounds.left,
      bounds.top,
      this.width,
      bounds.bottom - bounds.top
    );

    // einfache "Beschädigungs"-Optik: dunkler Rand + kleine Lücken
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      bounds.left + 1,
      bounds.top + 1,
      this.width - 2,
      bounds.bottom - bounds.top - 2
    );

    // HP-Leiste direkt über der Burg
    const barWidth = this.width;
    const barHeight = 6;
    const barX = bounds.left;
    const barY = bounds.top - 10;
    ctx.fillStyle = '#222';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = '#00e676';
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.restore();
  }
}
