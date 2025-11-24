// src/game/Projectile.ts
import type { Vec2 } from './types';
import { GRAVITY } from './Physics';

export class Projectile {
  position: Vec2;
  velocity: Vec2;
  radius: number;

  constructor(x: number, y: number, vx: number, vy: number, radius = 4) {
    this.position = { x, y };
    this.velocity = { x: vx, y: vy };
    this.radius = radius;
  }

  update(dt: number, windAcceleration: number): void {
    // Horizontaler Einfluss des Windes
    this.velocity.x += windAcceleration * dt;
    // Schwerkraft
    this.velocity.y += GRAVITY * dt;

    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = '#ffcc66';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
