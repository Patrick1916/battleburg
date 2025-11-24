// src/ui/HUD.ts
export type FireHandler = (angleDeg: number, power: number) => void;

export class HUD {
  private angleInput: HTMLInputElement;
  private angleValueSpan: HTMLElement;
  private powerInput: HTMLInputElement;
  private powerValueSpan: HTMLElement;
  private fireButton: HTMLButtonElement;
  private turnIndicator: HTMLElement;
  private windIndicator: HTMLElement;
  private hpLeftSpan: HTMLElement;
  private hpRightSpan: HTMLElement;
  private messageBox: HTMLElement;

  private fireHandler: FireHandler | null = null;

  constructor() {
    const angleInput = document.getElementById('angleSlider') as HTMLInputElement | null;
    const angleValueSpan = document.getElementById('angleValue') as HTMLElement | null;
    const powerInput = document.getElementById('powerSlider') as HTMLInputElement | null;
    const powerValueSpan = document.getElementById('powerValue') as HTMLElement | null;
    const fireButton = document.getElementById('fireButton') as HTMLButtonElement | null;
    const turnIndicator = document.getElementById('turnIndicator') as HTMLElement | null;
    const windIndicator = document.getElementById('windIndicator') as HTMLElement | null;
    const hpLeftSpan = document.getElementById('hpLeft') as HTMLElement | null;
    const hpRightSpan = document.getElementById('hpRight') as HTMLElement | null;
    const messageBox = document.getElementById('messageBox') as HTMLElement | null;

    if (
      !angleInput ||
      !angleValueSpan ||
      !powerInput ||
      !powerValueSpan ||
      !fireButton ||
      !turnIndicator ||
      !windIndicator ||
      !hpLeftSpan ||
      !hpRightSpan ||
      !messageBox
    ) {
      throw new Error('HUD-Elemente konnten nicht gefunden werden – prüfe die IDs in index.html.');
    }

    this.angleInput = angleInput;
    this.angleValueSpan = angleValueSpan;
    this.powerInput = powerInput;
    this.powerValueSpan = powerValueSpan;
    this.fireButton = fireButton;
    this.turnIndicator = turnIndicator;
    this.windIndicator = windIndicator;
    this.hpLeftSpan = hpLeftSpan;
    this.hpRightSpan = hpRightSpan;
    this.messageBox = messageBox;

    this.initEvents();
  }

  private initEvents(): void {
    this.angleInput.addEventListener('input', () => {
      this.angleValueSpan.textContent = `${this.angleInput.value}°`;
    });

    this.powerInput.addEventListener('input', () => {
      this.powerValueSpan.textContent = `${this.powerInput.value}%`;
    });

    this.fireButton.addEventListener('click', () => {
      if (!this.fireHandler) return;
      const angle = parseFloat(this.angleInput.value);
      const powerPercent = parseFloat(this.powerInput.value);
      const power = powerPercent / 100;
      this.fireHandler(angle, power);
    });
  }

  registerFireHandler(handler: FireHandler): void {
    this.fireHandler = handler;
  }

  setControlsEnabled(enabled: boolean): void {
    this.fireButton.disabled = !enabled;
    this.angleInput.disabled = !enabled;
    this.powerInput.disabled = !enabled;
  }

  updateHUD(
    currentPlayerName: string,
    hpLeft: number,
    maxHpLeft: number,
    hpRight: number,
    maxHpRight: number,
    wind: number
  ): void {
    this.turnIndicator.textContent = currentPlayerName;

    const windDirection = wind > 0 ? '→' : wind < 0 ? '←' : '-';
    const windStrength = Math.round(Math.abs(wind));
    this.windIndicator.textContent = `${windDirection} (${windStrength})`;

    this.hpLeftSpan.textContent = `${hpLeft} / ${maxHpLeft}`;
    this.hpRightSpan.textContent = `${hpRight} / ${maxHpRight}`;
  }

  showMessage(message: string): void {
    this.messageBox.textContent = message;
  }

  showWinner(winnerName: string): void {
    this.messageBox.textContent = `Spielende – Sieger: ${winnerName}`;
  }
}
