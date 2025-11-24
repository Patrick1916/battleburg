// src/game/Player.ts
import type { PlayerType } from './types';
import { Castle } from './Castle';
import { Weapon } from './Weapon';

export class Player {
  readonly name: string;
  readonly type: PlayerType;
  readonly castle: Castle;
  readonly weapon: Weapon;

  constructor(name: string, type: PlayerType, castle: Castle, weapon: Weapon) {
    this.name = name;
    this.type = type;
    this.castle = castle;
    this.weapon = weapon;
  }
}
