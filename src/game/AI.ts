// src/game/AI.ts
import type { Player } from './Player';
import { GRAVITY } from './Physics';

export type ShootFunction = (angleDeg: number, power: number) => void;

/**
 * Sehr einfache KI:
 * - Schätzt eine Flugbahn basierend auf Distanz und einer fixen Power
 * - Fügt ein bisschen Zufall hinzu
 * - Ignoriert Wind komplett (kann später erweitert werden)
 */
export class SimpleAI {
  takeTurn(player: Player, opponent: Player, shoot: ShootFunction): void {
    const dx = Math.abs(opponent.castle.position.x - player.castle.position.x);

    // Grobe Schätzung
    const basePower = 0.7; // 70% Power
    const estimatedSpeed = 250 + 350 * basePower; // muss zu Game-Konstanten passen
    const g = GRAVITY;

    // Formel: R ≈ v² / g * sin(2a)
    const inside = (g * dx) / (estimatedSpeed * estimatedSpeed);
    let angleRad = Math.PI / 4; // 45° fallback

    if (inside > 0 && inside < 1) {
      angleRad = 0.5 * Math.asin(Math.min(inside, 0.99));
    }

    let angleDeg = (angleRad * 180) / Math.PI;

    // ein wenig "Unfähigkeit"
    angleDeg += (Math.random() * 10 - 5); // ±5°

    const power = Math.min(1, Math.max(0.3, basePower + (Math.random() * 0.2 - 0.1)));

    shoot(angleDeg, power);
  }
}
