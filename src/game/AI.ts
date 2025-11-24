// src/game/AI.ts
import type { Player } from './Player';
import { GRAVITY, clamp } from './Physics';

export type ShootFunction = (angleDeg: number, power: number) => void;

/**
 * SimpleAI mit Difficulty 1..10:
 *  - 1: sehr zufällig, ignoriert Wind
 *  - 10: relativ präzise, berücksichtigt Wind grob
 */
export class SimpleAI {
  takeTurn(
    player: Player,
    opponent: Player,
    difficulty: number,
    wind: number,
    shoot: ShootFunction
  ): void {
    const dx = opponent.castle.position.x - player.castle.position.x;
    const distance = Math.abs(dx);
    const dir = player.castle.isLeftSide ? 1 : -1;

    const t = clamp((difficulty - 1) / 9, 0, 1); // 0..1

    // grobe Power-Abschätzung anhand Distanz
    let power = clamp(distance / 700, 0.35, 0.9);
    const estimatedSpeed = 250 + 350 * power;

    const inside = (GRAVITY * distance) / (estimatedSpeed * estimatedSpeed);
    let angleRad = Math.PI / 4;
    if (inside > 0 && inside < 1) {
      angleRad = 0.5 * Math.asin(Math.min(inside, 0.99));
    }
    let angleDeg = (angleRad * 180) / Math.PI;

    // Windkorrektur bei höheren Schwierigkeitsgraden
    const windDir = wind === 0 ? 0 : wind > 0 ? 1 : -1;
    const windStrength = Math.abs(wind);
    const maxWindCorrection = 8;
    const windFactor = clamp(windStrength / 120, 0, 1);
    const correctionBase = maxWindCorrection * windFactor * t;

    if (windDir !== 0 && correctionBase > 0) {
      const sameDirection = windDir === dir ? 1 : -1;
      angleDeg += -sameDirection * correctionBase;
    }

    // zufällige Ungenauigkeit abhängig von Schwierigkeit
    const maxAngleNoise = 16;
    const minAngleNoise = 1.5;
    const angleNoiseRange = maxAngleNoise - (maxAngleNoise - minAngleNoise) * t;
    const angleNoise = (Math.random() * 2 - 1) * angleNoiseRange;

    const maxPowerNoise = 0.25;
    const minPowerNoise = 0.03;
    const powerNoiseRange = maxPowerNoise - (maxPowerNoise - minPowerNoise) * t;
    const powerNoise = (Math.random() * 2 - 1) * powerNoiseRange;

    angleDeg += angleNoise;
    power = clamp(power + powerNoise, 0.2, 1);

    shoot(angleDeg, power);
  }
}
