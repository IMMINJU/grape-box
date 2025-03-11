"use client";

import { useReducer, useCallback, useMemo, useEffect } from "react";
import { gameReducer, initialState } from "./gameReducer";
import {
  type Apple,
  type Position,
  TOTAL_APPLES,
  TARGET_SUM,
  MAX_APPLE_VALUE,
  GAME_DURATION,
} from "./types";

export function useGameLogic() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const shuffleArray = useCallback((array: number[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }, []);

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

    return shuffleArray(board);
  }, [shuffleArray]);

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
    dispatch({ type: "SET_TIME", payload: GAME_DURATION });
  }, [initializeGame]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (state.isStarted && !state.gameOver && state.timeRemaining > 0) {
      timer = setInterval(() => {
        dispatch({ type: "TICK" });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.isStarted, state.gameOver, state.timeRemaining]);

  useEffect(() => {
    if (state.timeRemaining === 0) {
      dispatch({ type: "SET_GAME_OVER" });
    }
  }, [state.timeRemaining]);

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
