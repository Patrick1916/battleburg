// src/game/Physics.ts
import type { Vec2 } from './types';

export const GRAVITY = 500;

// Terrain-State
let terrainHeights: number[] = [];
let terrainWidth = 0;
let terrainHeight = 0;
let terrainInitialized = false;

/**
 * Pseudozufälliger Generator (Linear Congruential Generator),
 * damit die Karte pro Spiel konsistent ist.
 */
function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

/**
 * Erzeugt ein prozedurales Terrain-Profil über die Canvas-Breite.
 */
export function regenerateTerrain(
  canvasWidth: number,
  canvasHeight: number,
  seed?: number
): void {
  terrainWidth = canvasWidth;
  terrainHeight = canvasHeight;
  terrainHeights = new Array(canvasWidth + 1);

  const base = canvasHeight - 80;
  const minY = canvasHeight - 200;
  const maxY = canvasHeight - 40;

  const rng = createRng(seed ?? Math.floor(Math.random() * 0xffffffff));

  const freq1 = (0.5 + rng()) * 0.004; // lange Wellen
  const freq2 = (0.5 + rng()) * 0.008; // kürzere Wellen
  const phase1 = rng() * Math.PI * 2;
  const phase2 = rng() * Math.PI * 2;

  for (let x = 0; x <= canvasWidth; x++) {
    const nx = x;

    let y = base;

    // Sanfte Hügelkombination
    y -= Math.sin(nx * freq1 + phase1) * 60;
    y -= Math.sin(nx * freq2 + phase2) * 30;

    // Rauschen
    const noise = (rng() - 0.5) * 40;
    y += noise;

    // Ränder etwas glätten, damit Burgen stabil stehen
    const edgeFactor = Math.min(x / (canvasWidth * 0.1), (canvasWidth - x) / (canvasWidth * 0.1), 1);
    if (edgeFactor < 1) {
      y = base - (base - y) * edgeFactor;
    }

    y = Math.max(minY, Math.min(maxY, y));

    terrainHeights[x] = y;
  }

  terrainInitialized = true;
}

/**
 * Gibt die Terrainhöhe an Position x zurück.
 * Falls noch nicht initialisiert, wird einmalig generiert.
 */
export function getTerrainHeight(
  x: number,
  canvasWidth: number,
  canvasHeight: number
): number {
  if (!terrainInitialized || canvasWidth !== terrainWidth || canvasHeight !== terrainHeight) {
    regenerateTerrain(canvasWidth, canvasHeight);
  }

  const ix = Math.floor(Math.max(0, Math.min(terrainWidth, x)));
  return terrainHeights[ix] ?? canvasHeight - 60;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function length(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}
