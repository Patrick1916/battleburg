// src/main.ts
import './styles.css';
import { Game } from './game/Game';
import { HUD } from './ui/HUD';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
  if (!canvas) {
    console.error('Canvas-Element mit id="gameCanvas" nicht gefunden.');
    return;
  }

  console.log('[Battleburg] Initialisiere HUD und Game ...');
  const hud = new HUD();
  const game = new Game(canvas, hud);
  game.start();
});
