# Ballerburg Lite

Ein einfaches, browserbasiertes 2D-Kanonenspiel im Stil von „Ballerburg“:

- Zwei Burgen stehen sich auf einer 2D-Landschaft gegenüber.
- Jede Burg hat Strukturpunkte (HP) und eine Kanone.
- Pro Zug kann ein Schuss mit Winkel und Schusskraft abgegeben werden.
- Ballistische Flugbahn mit Schwerkraft und Wind.
- CPU-Gegner auf der rechten Burg.

## Features

- HTML5 Canvas (2D) Rendering
- TypeScript für bessere Wartbarkeit
- Vite als leichtgewichtiges Build-Tool
- 1 Spieler (Human) vs. CPU
- Terrain mit Hügel in der Mitte
- Lebenspunkte-Anzeige und einfache Schadensvisualisierung

---

## Lokale Entwicklung

### Voraussetzungen

- Node.js 18+ (empfohlen: 22.x LTS)
- npm

### Setup

```bash
git clone <dein-repo> ballerburg-lite
cd ballerburg-lite

npm install
npm run dev
