// src/game/Physics.ts
import type { Vec2 } from './types';

// Schwerkraft in Pixeln pro Sekunde² (Canvas-Koordinaten: y nach unten)
export const GRAVITY = 500;

/**
 * Terrain-Höhenfunktion: flache Ebene mit einem Hügel in der Mitte.
 * Gibt die y-Position des Bodens für eine gegebene x-Position zurück.
 */
export function getTerrainHeight(
  x: number,
  canvasWidth: number,
  canvasHeight: number
): number {
  const groundBase = canvasHeight - 60;
  const hillCenter = canvasWidth / 2;
  const hillHalfWidth = canvasWidth * 0.2;
  const hillHeight = 120;

  const dx = Math.abs(x - hillCenter);

  if (dx > hillHalfWidth) {
    return groundBase;
  }

  const t = dx / hillHalfWidth; // 0..1
  const heightOffset = hillHeight * (1 - t * t); // Parabel
  return groundBase - heightOffset;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function length(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}
