"use client";

import type React from "react";
import { useEffect, useRef, useCallback } from "react";
import clsx from "clsx";
import { useGameLogic } from "./useGameLogic";
import {
  type Position,
  GRID_COLS,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TARGET_SUM,
  SELECTION_BORDER_WIDTH,
  SELECTION_OPACITY,
  APPLE_FONT_SIZE,
  SCORE_FONT_SIZE,
  GAME_OVER_FONT_SIZE,
  BUTTON_PADDING,
  SELECTION_INDICATOR_OFFSET,
  SELECTION_INDICATOR_TOP_OFFSET,
} from "./types";

export default function FruitBox() {
  const { state, updateSelection, endSelection, checkGameOver, startGame } =
    useGameLogic();
  const boardRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    checkGameOver();
  }, [checkGameOver]);

  useEffect(() => {
    if (state.timeRemaining === 0 || state.gameOver) {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
      }
    }
  }, [state.timeRemaining, state.gameOver]);

  const getRelativePosition = useCallback((e: React.MouseEvent): Position => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (state.gameOver || !state.isStarted) return;
      const startPos = getRelativePosition(e);
      updateSelection(startPos, startPos);
    },
    [state.gameOver, state.isStarted, getRelativePosition, updateSelection]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!state.isSelecting || !state.selectionStart) return;
      const currentPos = getRelativePosition(e);
      updateSelection(state.selectionStart, currentPos);
    },
    [
      state.isSelecting,
      state.selectionStart,
      getRelativePosition,
      updateSelection,
    ]
  );

  const handleMouseUp = useCallback(() => {
    endSelection();
  }, [endSelection]);

  const handleGame = useCallback(() => {
    startGame();
    const audio = audioRef.current;
    if (audio) {
      audio.play();
      audio.volume = 0.2;
    }
  }, [startGame, audioRef]);

  const handleStart = useCallback(() => {
    startGame();
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  }, [startGame, audioRef]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <audio ref={audioRef} src="/audio.mp3" loop />
      <h1 className="text-4xl font-bold mb-8">Grape Box</h1>

      {!state.isStarted ? (
        <button
          className={clsx(
            BUTTON_PADDING,
            "bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xl"
          )}
          onClick={handleGame}
        >
          Start Game
        </button>
      ) : (
        <>
          <div className="mb-4 text-2xl font-bold">
            Time: {formatTime(state.timeRemaining)}
          </div>

          <div
            ref={boardRef}
            className={`grid gap-1 relative select-none`}
            style={{
              width: `${BOARD_WIDTH}px`,
              height: `${BOARD_HEIGHT}px`,
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {state.apples.map((apple, index) => (
              <div
                key={index}
                className="w-full h-full flex items-center justify-center"
              >
                {apple && (
                  <div
                    className={clsx(
                      "w-full h-full rounded-full flex items-center justify-center text-white font-bold transition-all duration-200",
                      APPLE_FONT_SIZE,
                      {
                        "bg-green-500 scale-110": apple.selected,
                        "bg-purple-700 hover:bg-purple-800": !apple.selected,
                      }
                    )}
                  >
                    {apple.value}
                  </div>
                )}
              </div>
            ))}
            {state.isSelecting &&
              state.selectionStart &&
              state.selectionEnd && (
                <>
                  <div
                    className="absolute border-blue-500 pointer-events-none"
                    style={{
                      left: Math.min(
                        state.selectionStart.x,
                        state.selectionEnd.x
                      ),
                      top: Math.min(
                        state.selectionStart.y,
                        state.selectionEnd.y
                      ),
                      width: Math.abs(
                        state.selectionEnd.x - state.selectionStart.x
                      ),
                      height: Math.abs(
                        state.selectionEnd.y - state.selectionStart.y
                      ),
                      borderWidth: `${SELECTION_BORDER_WIDTH}px`,
                      backgroundColor: `rgba(191, 219, 254, ${SELECTION_OPACITY})`,
                    }}
                  />
                  <div
                    className={clsx(
                      "absolute px-2 py-1 rounded-full text-white font-bold text-lg transition-all duration-200",
                      {
                        "bg-green-500": state.selectedSum === TARGET_SUM,
                        "bg-blue-500": state.selectedSum !== TARGET_SUM,
                      }
                    )}
                    style={{
                      left:
                        Math.max(state.selectionStart.x, state.selectionEnd.x) +
                        SELECTION_INDICATOR_OFFSET,
                      top:
                        Math.min(state.selectionStart.y, state.selectionEnd.y) -
                        SELECTION_INDICATOR_TOP_OFFSET,
                    }}
                  >
                    {state.selectedSum}
                  </div>
                </>
              )}
          </div>
          <div className="mt-8 text-center">
            <p className={clsx(SCORE_FONT_SIZE, "mb-4")}>
              Score: {state.score}
            </p>
            {(state.gameOver || state.timeRemaining === 0) && (
              <p
                className={clsx(
                  GAME_OVER_FONT_SIZE,
                  "font-bold text-green-500 mb-4"
                )}
              >
                {state.timeRemaining === 0
                  ? "Time's up!"
                  : "Game Over! All apples cleared!"}
              </p>
            )}
            <button
              className={clsx(
                BUTTON_PADDING,
                "bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              )}
              onClick={handleStart}
            >
              New Game
            </button>
          </div>
        </>
      )}
    </main>
  );
}
