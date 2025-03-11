import {
  type GameState,
  type GameAction,
  type Position,
  GRID_COLS,
  GRID_ROWS,
  TOTAL_APPLES,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TARGET_SUM,
  GAME_DURATION,
} from "./types";

export const initialState: GameState = {
  apples: Array(TOTAL_APPLES).fill(null),
  score: 0,
  gameOver: false,
  isSelecting: false,
  selectionStart: null,
  selectionEnd: null,
  selectedSum: 0,
  isStarted: false,
  timeRemaining: GAME_DURATION,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "INITIALIZE_GAME":
      return {
        ...initialState,
        apples: action.payload,
      };
    case "UPDATE_SELECTION":
      return updateSelection(state, action.payload.start, action.payload.end);
    case "END_SELECTION":
      return endSelection(state);
    case "SET_GAME_OVER":
      return { ...state, gameOver: true };
    case "TICK":
      return {
        ...state,
        timeRemaining: Math.max(0, state.timeRemaining - 1),
        gameOver: state.timeRemaining <= 1 || state.gameOver,
      };
    case "SET_TIME":
      return {
        ...state,
        timeRemaining: action.payload,
      };
    case "START_GAME":
      return {
        ...state,
        isStarted: true,
        timeRemaining: GAME_DURATION,
      };
    default:
      return state;
  }
}

function updateSelection(
  state: GameState,
  start: Position,
  end: Position
): GameState {
  const updatedApples = state.apples.map((apple, index) => {
    if (!apple) return null;
    const row = Math.floor(index / GRID_COLS);
    const col = index % GRID_COLS;
    const appleCenter = {
      x: (col + 0.5) * (BOARD_WIDTH / GRID_COLS),
      y: (row + 0.5) * (BOARD_HEIGHT / GRID_ROWS),
    };
    const selected = isPointInSelection(appleCenter, start, end);
    return { ...apple, selected };
  });

  const selectedSum = updatedApples.reduce(
    (acc, apple) => (apple && apple.selected ? acc + apple.value : acc),
    0
  );

  return {
    ...state,
    apples: updatedApples,
    isSelecting: true,
    selectionStart: start,
    selectionEnd: end,
    selectedSum,
  };
}

function endSelection(state: GameState): GameState {
  if (state.selectedSum === TARGET_SUM) {
    const newApples = state.apples.map((apple) =>
      apple && apple.selected ? null : apple
    );
    const removedApplesCount = state.apples.filter(
      (apple) => apple && apple.selected
    ).length;
    return {
      ...state,
      apples: newApples,
      score: state.score + removedApplesCount,
      isSelecting: false,
      selectionStart: null,
      selectionEnd: null,
      selectedSum: 0,
    };
  } else {
    return {
      ...state,
      apples: state.apples.map((apple) =>
        apple ? { ...apple, selected: false } : apple
      ),
      isSelecting: false,
      selectionStart: null,
      selectionEnd: null,
      selectedSum: 0,
    };
  }
}

function isPointInSelection(
  point: Position,
  start: Position,
  end: Position
): boolean {
  const minX = Math.min(start.x, end.x);
  const maxX = Math.max(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxY = Math.max(start.y, end.y);
  return (
    point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
  );
}
