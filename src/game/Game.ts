// src/game/Game.ts
import { HUD } from '../ui/HUD';
import { Player } from './Player';
import { Projectile } from './Projectile';
import { SimpleAI } from './AI';
import { GRAVITY, getTerrainHeight, clamp } from './Physics';
import type { Vec2 } from './types';
import { Castle } from './Castle';
import { Weapon } from './Weapon';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  private hud: HUD;
  private players: Player[] = [];
  private currentPlayerIndex = 0;
  private currentProjectile: Projectile | null = null;
  private wind = 0;
  private lastTimestamp = 0;
  private running = false;
  private simpleAI: SimpleAI;

  private readonly baseSpeed = 250;
  private readonly extraSpeed = 350;

  // Aim-Status des Spielers (für Preview)
  private aimAngleDeg = 45;
  private aimPower = 0.6;

  constructor(canvas: HTMLCanvasElement, hud: HUD) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2D-Canvas-Kontext konnte nicht initialisiert werden.');
    }
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    this.hud = hud;
    this.simpleAI = new SimpleAI();

    this.setupWorld();

    this.hud.registerFireHandler((angleDeg, power) => this.handleFire(angleDeg, power));
    this.hud.registerAimChangeHandler((angleDeg, power) =>
      this.updateAim(angleDeg, power)
    );

    this.updateHud();
  }

  private get currentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  private setupWorld(): void {
    const leftX = this.width * 0.15;
    const rightX = this.width * 0.85;

    const groundLeft = getTerrainHeight(leftX, this.width, this.height);
    const groundRight = getTerrainHeight(rightX, this.width, this.height);

    const castleWidth = 60;
    const castleHeight = 140;
    const maxHp = 100;

    const leftCastlePos: Vec2 = { x: leftX, y: groundLeft };
    const rightCastlePos: Vec2 = { x: rightX, y: groundRight };

    const leftCastle = new Castle(
      leftCastlePos,
      castleWidth,
      castleHeight,
      maxHp,
      true,
      '#4ea5ff'
    );
    const rightCastle = new Castle(
      rightCastlePos,
      castleWidth,
      castleHeight,
      maxHp,
      false,
      '#ff6b6b'
    );

    const leftWeapon = new Weapon(leftCastle, 2);
    const rightWeapon = new Weapon(rightCastle, 2);

    const player1 = new Player('Spieler', 'human', leftCastle, leftWeapon);
    const player2 = new Player('CPU', 'ai', rightCastle, rightWeapon);

    this.players = [player1, player2];
    this.currentPlayerIndex = 0;
    this.randomizeWind();
  }

  start(): void {
    this.running = true;
    this.lastTimestamp = performance.now();
    this.prepareTurn();
    requestAnimationFrame(this.loop);
  }

  private loop = (timestamp: number): void => {
    const rawDt = (timestamp - this.lastTimestamp) / 1000;
    const dt = Math.min(rawDt, 0.05);
    this.lastTimestamp = timestamp;

    if (this.running) {
      this.update(dt);
    }
    this.render();

    requestAnimationFrame(this.loop);
  };

  private update(dt: number): void {
    for (const player of this.players) {
      player.weapon.update(dt);
    }

    if (this.currentProjectile) {
      this.currentProjectile.update(dt, this.wind);

      const proj = this.currentProjectile;

      if (
        proj.position.x < 0 ||
        proj.position.x > this.width ||
        proj.position.y > this.height
      ) {
        this.handleImpact(null);
        return;
      }

      const terrainY = getTerrainHeight(proj.position.x, this.width, this.height);
      if (proj.position.y >= terrainY) {
        this.handleImpact(null);
        return;
      }

      for (const player of this.players) {
        const castle = player.castle;
        const bounds = castle.getBounds();
        if (
          proj.position.x >= bounds.left &&
          proj.position.x <= bounds.right &&
          proj.position.y >= bounds.top &&
          proj.position.y <= bounds.bottom
        ) {
          this.handleImpact(castle);
          return;
        }
      }
    }
  }

  private handleImpact(hitCastle: Castle | null): void {
    if (hitCastle) {
      const damage = 25;
      hitCastle.applyDamage(damage);
      this.hud.showMessage(
        `${this.currentPlayer.name} trifft die gegnerische Burg (-${damage} HP)!`
      );
    } else {
      this.hud.showMessage('Der Schuss verfehlt sein Ziel.');
    }

    this.currentProjectile = null;
    this.updateHud();

    if (this.checkVictory()) {
      return;
    }

    this.nextTurn();
  }

  private nextTurn(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.randomizeWind();
    this.updateHud();
    this.prepareTurn();
  }

  private prepareTurn(): void {
    const current = this.currentPlayer;

    if (current.type === 'human') {
      this.hud.setControlsEnabled(true);
      this.hud.showMessage(
        'Du bist am Zug. Winkel & Schusskraft einstellen und feuern.'
      );
      // Waffe des Spielers auf aktuellen Aim-Winkel setzen
      current.weapon.setAimAngle(this.aimAngleDeg);
    } else {
      this.hud.setControlsEnabled(false);
      this.hud.showMessage('CPU zielt...');
      window.setTimeout(() => {
        const opponent =
          this.players[0] === current ? this.players[1] : this.players[0];
        this.simpleAI.takeTurn(
          current,
          opponent,
          (angleDeg, power) => this.handleFire(angleDeg, power)
        );
      }, 800);
    }
  }

  private randomizeWind(): void {
    this.wind = Math.random() * 160 - 80;
  }

  private checkVictory(): boolean {
    const [p1, p2] = this.players;
    if (p1.castle.hp <= 0 && p2.castle.hp <= 0) {
      this.running = false;
      this.hud.setControlsEnabled(false);
      this.hud.showWinner('Niemand – beide Burgen zerstört!');
      return true;
    }

    if (p1.castle.hp <= 0) {
      this.running = false;
      this.hud.setControlsEnabled(false);
      this.hud.showWinner(p2.name);
      return true;
    }

    if (p2.castle.hp <= 0) {
      this.running = false;
      this.hud.setControlsEnabled(false);
      this.hud.showWinner(p1.name);
      return true;
    }

    return false;
  }

  private updateHud(): void {
    const [p1, p2] = this.players;
    this.hud.updateHUD(
      this.currentPlayer.name,
      p1.castle.hp,
      p1.castle.maxHp,
      p2.castle.hp,
      p2.castle.maxHp,
      this.wind
    );
  }

  private updateAim(angleDeg: number, power: number): void {
    this.aimAngleDeg = angleDeg;
    this.aimPower = power;

    // Nur sinnvoll für den menschlichen Spieler
    const current = this.currentPlayer;
    if (current.type === 'human') {
      current.weapon.setAimAngle(angleDeg);
    }
  }

  private handleFire(angleDeg: number, power: number): void {
    if (this.currentProjectile) return;

    const shooter = this.currentPlayer;
    const weapon = shooter.weapon;

    if (!weapon.canFire()) {
      this.hud.showMessage('Die Waffe lädt noch nach...');
      return;
    }

    const muzzle = weapon.getMuzzlePosition();
    const isLeft = shooter.castle.isLeftSide;

    const clampedPower = clamp(power, 0.1, 1);
    const angleRad = (angleDeg * Math.PI) / 180;

    const direction = isLeft ? 1 : -1;
    const speed = this.baseSpeed + this.extraSpeed * clampedPower;

    const vx = Math.cos(angleRad) * speed * direction;
    const vy = -Math.sin(angleRad) * speed;

    this.currentProjectile = new Projectile(muzzle.x, muzzle.y, vx, vy, 4);
    weapon.markFired();
    weapon.setAimAngle(angleDeg); // Rohr zeigt in Schussrichtung
    this.hud.setControlsEnabled(false);
    this.hud.showMessage(`${shooter.name} feuert!`);
  }

  private drawTrajectoryPreview(ctx: CanvasRenderingContext2D): void {
    if (this.currentProjectile) return;

    const current = this.currentPlayer;
    if (current.type !== 'human') return;

    const muzzle = current.weapon.getMuzzlePosition();
    const isLeft = current.castle.isLeftSide;

    const clampedPower = clamp(this.aimPower, 0.1, 1);
    const angleRad = (this.aimAngleDeg * Math.PI) / 180;
    const direction = isLeft ? 1 : -1;
    const speed = this.baseSpeed + this.extraSpeed * clampedPower;

    let vx = Math.cos(angleRad) * speed * direction;
    let vy = -Math.sin(angleRad) * speed;
    let x = muzzle.x;
    let y = muzzle.y;

    const dt = 0.05;
    const maxSteps = 60;
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i < maxSteps; i++) {
      vx += this.wind * dt;
      vy += GRAVITY * dt;
      x += vx * dt;
      y += vy * dt;

      if (x < 0 || x > this.width || y > this.height) break;

      const terrainY = getTerrainHeight(x, this.width, this.height);
      if (y >= terrainY) break;

      points.push({ x, y });
    }

    if (points.length === 0) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  private render(): void {
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.width, this.height);

    // Hintergrund
    ctx.fillStyle = '#0b0d12';
    ctx.fillRect(0, 0, this.width, this.height);

    const skyGradient = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGradient.addColorStop(0, '#1f2937');
    skyGradient.addColorStop(1, '#0b0d12');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Terrain
    ctx.fillStyle = '#314024';
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    for (let x = 0; x <= this.width; x += 4) {
      const y = getTerrainHeight(x, this.width, this.height);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fill();

    // Trajektorien-Vorschau (nur Spieler, kein aktives Projektil)
    this.drawTrajectoryPreview(ctx);

    // Burgen & Waffen
    for (const player of this.players) {
      player.castle.draw(ctx);
      player.weapon.draw(ctx);
    }

    // Projektil
    if (this.currentProjectile) {
      this.currentProjectile.draw(ctx);
    }
  }
}
