// src/ui/HUD.ts
export type FireHandler = (angleDeg: number, power: number) => void;
export type AimChangeHandler = (angleDeg: number, power: number) => void;
export type RestartHandler = () => void;
export type DifficultyChangeHandler = (difficulty: number) => void;

export type EconomyAction = 'repair' | 'income';
export type EconomyActionHandler = (action: EconomyAction) => void;

export class HUD {
  private angleInput: HTMLInputElement;
  private angleValueSpan: HTMLElement;
  private powerInput: HTMLInputElement;
  private powerValueSpan: HTMLElement;
  private difficultyInput: HTMLInputElement;
  private difficultyValueSpan: HTMLElement;

  private repairButton: HTMLButtonElement;
  private incomeButton: HTMLButtonElement;

  private fireButton: HTMLButtonElement;
  private newGameButton: HTMLButtonElement;
  private turnIndicator: HTMLElement;
  private windIndicator: HTMLElement;
  private hpLeftSpan: HTMLElement;
  private hpRightSpan: HTMLElement;
  private goldLeftSpan: HTMLElement;
  private goldRightSpan: HTMLElement;
  private messageBox: HTMLElement;

  private fireHandler: FireHandler | null = null;
  private aimChangeHandler: AimChangeHandler | null = null;
  private restartHandler: RestartHandler | null = null;
  private difficultyChangeHandler: DifficultyChangeHandler | null = null;
  private economyHandler: EconomyActionHandler | null = null;

  constructor() {
    const angleInput = document.getElementById('angleSlider') as HTMLInputElement | null;
    const angleValueSpan = document.getElementById('angleValue') as HTMLElement | null;
    const powerInput = document.getElementById('powerSlider') as HTMLInputElement | null;
    const powerValueSpan = document.getElementById('powerValue') as HTMLElement | null;
    const difficultyInput = document.getElementById('difficultySlider') as HTMLInputElement | null;
    const difficultyValueSpan = document.getElementById('difficultyValue') as HTMLElement | null;

    const repairButton = document.getElementById('repairButton') as HTMLButtonElement | null;
    const incomeButton = document.getElementById('incomeButton') as HTMLButtonElement | null;

    const fireButton = document.getElementById('fireButton') as HTMLButtonElement | null;
    const newGameButton = document.getElementById('newGameButton') as HTMLButtonElement | null;
    const turnIndicator = document.getElementById('turnIndicator') as HTMLElement | null;
    const windIndicator = document.getElementById('windIndicator') as HTMLElement | null;
    const hpLeftSpan = document.getElementById('hpLeft') as HTMLElement | null;
    const hpRightSpan = document.getElementById('hpRight') as HTMLElement | null;
    const goldLeftSpan = document.getElementById('goldLeft') as HTMLElement | null;
    const goldRightSpan = document.getElementById('goldRight') as HTMLElement | null;
    const messageBox = document.getElementById('messageBox') as HTMLElement | null;

    if (
      !angleInput ||
      !angleValueSpan ||
      !powerInput ||
      !powerValueSpan ||
      !difficultyInput ||
      !difficultyValueSpan ||
      !repairButton ||
      !incomeButton ||
      !fireButton ||
      !newGameButton ||
      !turnIndicator ||
      !windIndicator ||
      !hpLeftSpan ||
      !hpRightSpan ||
      !goldLeftSpan ||
      !goldRightSpan ||
      !messageBox
    ) {
      throw new Error('HUD-Elemente konnten nicht gefunden werden – prüfe die IDs in index.html.');
    }

    this.angleInput = angleInput;
    this.angleValueSpan = angleValueSpan;
    this.powerInput = powerInput;
    this.powerValueSpan = powerValueSpan;
    this.difficultyInput = difficultyInput;
    this.difficultyValueSpan = difficultyValueSpan;
    this.repairButton = repairButton;
    this.incomeButton = incomeButton;
    this.fireButton = fireButton;
    this.newGameButton = newGameButton;
    this.turnIndicator = turnIndicator;
    this.windIndicator = windIndicator;
    this.hpLeftSpan = hpLeftSpan;
    this.hpRightSpan = hpRightSpan;
    this.goldLeftSpan = goldLeftSpan;
    this.goldRightSpan = goldRightSpan;
    this.messageBox = messageBox;

    this.initEvents();
  }

  private initEvents(): void {
    this.angleInput.addEventListener('input', () => {
      this.angleValueSpan.textContent = `${this.angleInput.value}°`;
      this.notifyAimChange();
    });

    this.powerInput.addEventListener('input', () => {
      this.powerValueSpan.textContent = `${this.powerInput.value}%`;
      this.notifyAimChange();
    });

    this.difficultyInput.addEventListener('input', () => {
      const value = parseInt(this.difficultyInput.value, 10);
      this.difficultyValueSpan.textContent = `${value} / 10`;
      if (this.difficultyChangeHandler) {
        this.difficultyChangeHandler(value);
      }
    });

    this.fireButton.addEventListener('click', () => {
      if (!this.fireHandler) return;
      const angle = parseFloat(this.angleInput.value);
      const powerPercent = parseFloat(this.powerInput.value);
      const power = powerPercent / 100;
      this.fireHandler(angle, power);
    });

    this.newGameButton.addEventListener('click', () => {
      if (this.restartHandler) {
        this.restartHandler();
      }
    });

    this.repairButton.addEventListener('click', () => {
      if (this.economyHandler) {
        this.economyHandler('repair');
      }
    });

    this.incomeButton.addEventListener('click', () => {
      if (this.economyHandler) {
        this.economyHandler('income');
      }
    });

    // Initialanzeigen
    this.angleValueSpan.textContent = `${this.angleInput.value}°`;
    this.powerValueSpan.textContent = `${this.powerInput.value}%`;
    const diffVal = parseInt(this.difficultyInput.value, 10);
    this.difficultyValueSpan.textContent = `${diffVal} / 10`;
  }

  private notifyAimChange(): void {
    if (!this.aimChangeHandler) return;
    const angle = parseFloat(this.angleInput.value);
    const powerPercent = parseFloat(this.powerInput.value);
    const power = powerPercent / 100;
    this.aimChangeHandler(angle, power);
  }

  registerFireHandler(handler: FireHandler): void {
    this.fireHandler = handler;
  }

  registerAimChangeHandler(handler: AimChangeHandler): void {
    this.aimChangeHandler = handler;
    const angle = parseFloat(this.angleInput.value);
    const power = parseFloat(this.powerInput.value) / 100;
    handler(angle, power);
  }

  registerRestartHandler(handler: RestartHandler): void {
    this.restartHandler = handler;
  }

  registerDifficultyChangeHandler(handler: DifficultyChangeHandler): void {
    this.difficultyChangeHandler = handler;
    const value = parseInt(this.difficultyInput.value, 10);
    handler(value);
  }

  registerEconomyHandler(handler: EconomyActionHandler): void {
    this.economyHandler = handler;
  }

  setControlsEnabled(enabled: boolean): void {
    this.fireButton.disabled = !enabled;
    this.angleInput.disabled = !enabled;
    this.powerInput.disabled = !enabled;
    this.repairButton.disabled = !enabled;
    this.incomeButton.disabled = !enabled;
    // Schwierigkeit & Neues Spiel bleiben weiterhin bedienbar
  }

  updateHUD(
    currentPlayerName: string,
    hpLeft: number,
    maxHpLeft: number,
    hpRight: number,
    maxHpRight: number,
    wind: number,
    goldLeft: number,
    goldRight: number
  ): void {
    this.turnIndicator.textContent = currentPlayerName;

    const windDirection = wind > 0 ? '→' : wind < 0 ? '←' : '-';
    const windStrength = Math.round(Math.abs(wind));
    this.windIndicator.textContent = `${windDirection} (${windStrength})`;

    this.hpLeftSpan.textContent = `${hpLeft} / ${maxHpLeft}`;
    this.hpRightSpan.textContent = `${hpRight} / ${maxHpRight}`;

    this.goldLeftSpan.textContent = `${Math.round(goldLeft)}`;
    this.goldRightSpan.textContent = `${Math.round(goldRight)}`;
  }

  showMessage(message: string): void {
    this.messageBox.textContent = message;
  }

  showWinner(winnerName: string): void {
    this.messageBox.textContent = `Spielende – Sieger: ${winnerName}`;
  }
}
