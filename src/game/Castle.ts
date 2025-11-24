// src/game/Castle.ts
import type { Vec2 } from './types';

export class Castle {
  readonly position: Vec2;
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

  // NEU: Reparatur
  repair(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  private getCurrentHeight(): number {
    const ratio = this.hp / this.maxHp;
    const clampedRatio = Math.max(0.2, ratio);
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
      y: bounds.top - 6
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const bounds = this.getBounds();
    const w = this.width;
    const h = bounds.bottom - bounds.top;
    const hpRatio = this.hp / this.maxHp;

    ctx.save();

    // Schatten hinter der Burg
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;

    // Hauptkörper der Burg
    ctx.fillStyle = this.baseColor;
    ctx.fillRect(bounds.left, bounds.top, w, h);

    ctx.shadowColor = 'transparent'; // Schatten für Details aus

    // leichte Kante oben/unten für mehr Tiefe
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fillRect(bounds.left, bounds.top, w, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(bounds.left, bounds.bottom - 6, w, 6);

    // Zinnen (Zacken oben)
    const battlementHeight = Math.max(6, h * 0.12);
    const battlementWidth = Math.max(8, w / 6);
    ctx.fillStyle = '#111827'; // dunkler Aufsatz
    for (let x = bounds.left; x < bounds.right; x += battlementWidth * 1.5) {
      const bw = Math.min(battlementWidth, bounds.right - x);
      ctx.fillRect(x, bounds.top - battlementHeight, bw, battlementHeight);
    }

    // Mauerstruktur (angedeutete Steine)
    const brickHeight = 8;
    const brickWidth = 16;
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;

    for (let y = bounds.top + 8; y < bounds.bottom - 8; y += brickHeight) {
      const rowIndex = Math.floor((y - bounds.top) / brickHeight);
      const offset = (rowIndex % 2 === 1) ? brickWidth / 2 : 0;

      for (let x = bounds.left + offset; x < bounds.right; x += brickWidth) {
        const bw = Math.min(brickWidth, bounds.right - x);
        const bh = Math.min(brickHeight, bounds.bottom - 8 - y);
        ctx.strokeRect(x, y, bw, bh);
      }
    }

    // Tor
    const doorWidth = w * 0.28;
    const doorHeight = h * 0.35;
    const doorX = this.position.x - doorWidth / 2;
    const doorY = bounds.bottom - doorHeight;

    ctx.fillStyle = '#111318';
    ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(doorX, doorY, doorWidth, doorHeight);

    // Torbogen
    ctx.beginPath();
    ctx.arc(
      this.position.x,
      doorY,
      doorWidth / 2,
      Math.PI,
      0,
      false
    );
    ctx.fillStyle = '#0b0d12';
    ctx.fill();

    // Fenster (zwei kleine Schießscharten)
    const windowWidth = w * 0.16;
    const windowHeight = windowWidth * 0.6;
    const windowY = bounds.top + h * 0.35;

    const windowX1 = bounds.left + w * 0.18;
    const windowX2 = bounds.right - w * 0.18 - windowWidth;

    ctx.fillStyle = '#020617';
    ctx.strokeStyle = 'rgba(15,23,42,0.8)';

    ctx.fillRect(windowX1, windowY, windowWidth, windowHeight);
    ctx.strokeRect(windowX1, windowY, windowWidth, windowHeight);

    ctx.fillRect(windowX2, windowY, windowWidth, windowHeight);
    ctx.strokeRect(windowX2, windowY, windowWidth, windowHeight);

    // Flagge
    const flagPoleHeight = h * 0.45;
    const flagPoleX = this.position.x + (this.isLeftSide ? -w * 0.18 : w * 0.18);
    const flagPoleTopY = bounds.top - battlementHeight - flagPoleHeight;

    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(flagPoleX - 1, flagPoleTopY, 2, flagPoleHeight + battlementHeight);

    const flagWidth = w * 0.3;
    const flagHeight = h * 0.18;
    const flagY = flagPoleTopY + 4;

    ctx.beginPath();
    if (this.isLeftSide) {
      ctx.moveTo(flagPoleX, flagY);
      ctx.lineTo(flagPoleX + flagWidth, flagY + flagHeight / 2);
      ctx.lineTo(flagPoleX, flagY + flagHeight);
    } else {
      ctx.moveTo(flagPoleX, flagY);
      ctx.lineTo(flagPoleX - flagWidth, flagY + flagHeight / 2);
      ctx.lineTo(flagPoleX, flagY + flagHeight);
    }
    ctx.closePath();
    ctx.fillStyle = this.isLeftSide ? '#38bdf8' : '#f97373';
    ctx.fill();

    // HP-Leiste über der Burg
    const barWidth = this.width;
    const barHeight = 6;
    const barX = this.position.x - barWidth / 2;
    const barY = bounds.top - battlementHeight - 16;

    ctx.fillStyle = '#111827';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = '#00e676';
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.restore();
  }
}
