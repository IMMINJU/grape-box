export interface Apple {
  value: number;
  selected: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  apples: (Apple | null)[];
  score: number;
  gameOver: boolean;
  isSelecting: boolean;
  selectionStart: Position | null;
  selectionEnd: Position | null;
  selectedSum: number;
  isStarted: boolean;
  timeRemaining: number;
}

export type GameAction =
  | { type: "INITIALIZE_GAME"; payload: (Apple | null)[] }
  | { type: "UPDATE_SELECTION"; payload: { start: Position; end: Position } }
  | { type: "END_SELECTION" }
  | { type: "SET_GAME_OVER" }
  | { type: "START_GAME" }
  | { type: "TICK" }
  | { type: "SET_TIME"; payload: number };

export const GRID_COLS = 17;
export const GRID_ROWS = 10;
export const TOTAL_APPLES = GRID_COLS * GRID_ROWS;
export const BOARD_WIDTH = 850;
export const BOARD_HEIGHT = 500;
export const TARGET_SUM = 10;
export const MAX_APPLE_VALUE = 9;
export const MIN_APPLE_VALUE = 1;
export const SELECTION_BORDER_WIDTH = 2;
export const SELECTION_OPACITY = 0.3;
export const APPLE_FONT_SIZE = "text-sm";
export const SCORE_FONT_SIZE = "text-2xl";
export const GAME_OVER_FONT_SIZE = "text-2xl";
export const BUTTON_PADDING = "px-4 py-2";
export const SELECTION_INDICATOR_OFFSET = 10;
export const SELECTION_INDICATOR_TOP_OFFSET = 30;
export const GAME_DURATION = 120; // 3분(180초)
