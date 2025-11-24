// src/game/Game.ts
import { HUD } from '../ui/HUD';
import { Player } from './Player';
import { Projectile } from './Projectile';
import { SimpleAI } from './AI';
import { getTerrainHeight, clamp } from './Physics';
import type { Vec2 } from './types';
import { Castle } from './Castle';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  private hud: HUD;
  private players: Player[] = [];
  private currentPlayerIndex = 0;
  private currentProjectile: Projectile | null = null;
  private wind = 0; // Pixel/s² (positive: nach rechts)
  private lastTimestamp = 0;
  private running = false;
  private simpleAI: SimpleAI;

  // Schuss-Parameter
  private readonly baseSpeed = 250;
  private readonly extraSpeed = 350;

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
    this.updateHud();
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

    const leftCastle = new Castle(leftCastlePos, castleWidth, castleHeight, maxHp, true, '#4ea5ff');
    const rightCastle = new Castle(rightCastlePos, castleWidth, castleHeight, maxHp, false, '#ff6b6b');

    // Waffen
    const { Weapon } = require('./Weapon') as typeof import('./Weapon'); // Workaround: require, um Zyklus zu vermeiden
    // Hinweis: Wenn du ES-Imports strikt halten willst, kannst du Weapon auch direkt importieren
    // und ggf. die Struktur minimal anpassen, damit keine Zyklen entstehen.

    const leftWeapon = new Weapon(leftCastle, 2);
    const rightWeapon = new Weapon(rightCastle, 2);

    const player1 = new Player('Spieler', 'human', leftCastle, leftWeapon);
    const player2 = new Player('CPU', 'ai', rightCastle, rightWeapon);

    this.players = [player1, player2];
    this.currentPlayerIndex = 0;
    this.randomizeWind();
  }

  get currentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  private getOpponentOf(player: Player): Player {
    return this.players[0] === player ? this.players[1] : this.players[0];
  }

  start(): void {
    this.running = true;
    this.lastTimestamp = performance.now();
    this.prepareTurn();
    requestAnimationFrame(this.loop);
  }

  private loop = (timestamp: number): void => {
    const rawDt = (timestamp - this.lastTimestamp) / 1000;
    const dt = Math.min(rawDt, 0.05); // dt clamp
    this.lastTimestamp = timestamp;

    if (this.running) {
      this.update(dt);
    }
    this.render();

    requestAnimationFrame(this.loop);
  };

  private update(dt: number): void {
    // Waffen-Cooldowns aktualisieren
    for (const player of this.players) {
      player.weapon.update(dt);
    }

    if (this.currentProjectile) {
      this.currentProjectile.update(dt, this.wind);

      const proj = this.currentProjectile;

      // Canvas verlassen?
      if (
        proj.position.x < 0 ||
        proj.position.x > this.width ||
        proj.position.y > this.height
      ) {
        this.handleImpact(null);
        return;
      }

      // Terrain-Kollision
      const terrainY = getTerrainHeight(proj.position.x, this.width, this.height);
      if (proj.position.y >= terrainY) {
        this.handleImpact(null);
        return;
      }

      // Burg-Kollision
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
      this.hud.showMessage('Du bist am Zug. Winkel & Schusskraft einstellen und feuern.');
    } else {
      this.hud.setControlsEnabled(false);
      this.hud.showMessage('CPU zielt...');
      window.setTimeout(() => {
        this.simpleAI.takeTurn(
          current,
          this.getOpponentOf(current),
          (angleDeg, power) => this.handleFire(angleDeg, power)
        );
      }, 800);
    }
  }

  private randomizeWind(): void {
    // Wind zwischen -80 und +80 Pixel/s²
    this.wind = (Math.random() * 160 - 80);
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

  private handleFire(angleDeg: number, power: number): void {
    if (this.currentProjectile) {
      return;
    }

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
    const vy = -Math.sin(angleRad) * speed; // negativ: nach oben

    this.currentProjectile = new Projectile(muzzle.x, muzzle.y, vx, vy, 4);
    weapon.markFired();
    this.hud.setControlsEnabled(false);
    this.hud.showMessage(`${shooter.name} feuert!`);
  }

  private render(): void {
    const ctx = this.ctx;

    // Hintergrund
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#0b0d12';
    ctx.fillRect(0, 0, this.width, this.height);

    // Himmel
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

    // Burgen und Waffen
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
