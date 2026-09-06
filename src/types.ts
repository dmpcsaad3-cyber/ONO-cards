export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';

export type CardValue =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'skip'
  | 'reverse'
  | 'draw2'
  | 'wild'
  | 'wild_draw4';

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
  scoreValue: number;
}

export interface Player {
  id: string;
  name: string;
  isAI: boolean;
  avatar: string;
  hand: Card[];
  score: number;
  hasCalledOno: boolean;
  canBeCaughtOno: boolean;
}

export type GameMode = 'pve' | 'pass_and_play';

export type GameStatus =
  | 'menu'
  | 'playing'
  | 'color_picker'
  | 'pass_turn'
  | 'round_over'
  | 'game_over';

export interface GameSettings {
  playerCount: 2 | 3 | 4;
  mode: GameMode;
  aiSpeed: 'slow' | 'normal' | 'fast';
  soundEnabled: boolean;
  enableStacking: boolean; // Draw 2 on Draw 2, Draw 4 on Draw 4
  enableJumpIn: boolean; // Same exact card played immediately
  onoPenaltyCards: number; // Penalty when caught (default 2)
  targetScore: number; // Usually 500 points for tournament
}

export interface GameLogEntry {
  id: string;
  text: string;
  type: 'play' | 'draw' | 'action' | 'ono' | 'penalty' | 'win';
  timestamp: number;
}
