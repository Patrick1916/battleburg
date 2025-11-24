// src/game/Player.ts
import { Castle } from './Castle';
import { Weapon } from './Weapon';

export type PlayerType = 'human' | 'ai';

export class Player {
  name: string;
  type: PlayerType;
  castle: Castle;
  weapon: Weapon;

  gold: number;
  incomeLevel: number;

  constructor(
    name: string,
    type: PlayerType,
    castle: Castle,
    weapon: Weapon,
    initialGold = 40
  ) {
    this.name = name;
    this.type = type;
    this.castle = castle;
    this.weapon = weapon;
    this.gold = initialGold;
    this.incomeLevel = 0;
  }

  getIncomePerTurn(): number {
    const baseIncome = 15;
    const perLevel = 10;
    return baseIncome + this.incomeLevel * perLevel;
  }

  addGold(amount: number): void {
    this.gold += amount;
  }

  canAfford(cost: number): boolean {
    return this.gold >= cost;
  }

  spendGold(cost: number): boolean {
    if (this.gold < cost) return false;
    this.gold -= cost;
    return true;
  }
}
