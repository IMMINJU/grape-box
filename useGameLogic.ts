"use client";

import { useReducer, useCallback, useMemo } from "react";
import { gameReducer, initialState } from "./app/gameReducer";
import {
  type Apple,
  type Position,
  TOTAL_APPLES,
  TARGET_SUM,
  MAX_APPLE_VALUE,
} from "./app/types";

export function useGameLogic() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const generateValidBoard = useCallback(() => {
    const board: number[] = [];
    let remainingSum = 0;

    while (board.length < TOTAL_APPLES) {
      if (remainingSum === 0) {
        remainingSum = TARGET_SUM;
      }

      const maxValue = Math.min(remainingSum, MAX_APPLE_VALUE);
      const value = Math.floor(Math.random() * maxValue) + 1;
      board.push(value);
      remainingSum -= value;

      if (remainingSum === 0 && board.length < TOTAL_APPLES) {
        remainingSum = TARGET_SUM;
      }
    }

    return board;
  }, []);

  const initializeGame = useCallback(() => {
    const newBoard = generateValidBoard();
    const newApples: (Apple | null)[] = newBoard.map((value) => ({
      value,
      selected: false,
    }));
    dispatch({ type: "INITIALIZE_GAME", payload: newApples });
  }, [generateValidBoard]);

  const updateSelection = useCallback((start: Position, end: Position) => {
    dispatch({ type: "UPDATE_SELECTION", payload: { start, end } });
  }, []);

  const endSelection = useCallback(() => {
    dispatch({ type: "END_SELECTION" });
  }, []);

  const checkGameOver = useCallback(() => {
    if (state.apples.every((apple) => apple === null) && state.score > 0) {
      dispatch({ type: "SET_GAME_OVER" });
    }
  }, [state.apples, state.score]);

  const startGame = useCallback(() => {
    initializeGame();
    dispatch({ type: "START_GAME" });
  }, [initializeGame]);

  const memoizedState = useMemo(() => state, [state]);

  return {
    state: memoizedState,
    initializeGame,
    updateSelection,
    endSelection,
    checkGameOver,
    startGame,
  };
}
