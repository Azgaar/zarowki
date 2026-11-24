import { useEffect, useReducer, useState } from 'react';
import { getBoardCue } from '../audio/cues';
import { play } from '../audio/play';
import { createBoard, type BoardAction, type BoardState, boardReducer, getRankTier, restoreBoard } from '../game/board';
import { nextGame } from '../game/room';
import { load, save } from '../game/storage';
import type { Room } from '../game/types';
import { BoardScreen } from './BoardScreen';
import { ResultScreen } from './ResultScreen';
import { SetupScreen } from './SetupScreen';

type Action = BoardAction | { type: 'start'; room: Room } | { type: 'quit' };

function reducer(board: BoardState | null, action: Action): BoardState | null {
  if (action.type === 'start') return createBoard(action.room);
  if (action.type === 'quit') return null;
  return board && boardReducer(board, action);
}

/** The board is the only stateful device, so it survives a refresh through localStorage. */
export function StarterScreen() {
  const [board, dispatch] = useReducer(reducer, null, () => restoreBoard(load('board')));
  // A loss stays on the board until acknowledged, so everyone sees the fatal card.
  const [lossSeen, setLossSeen] = useState(false);
  useEffect(() => save('board', board), [board]);

  const quit = () => {
    setLossSeen(false);
    dispatch({ type: 'quit' });
  };

  const playAgain = () => {
    if (!board) return;
    setLossSeen(false);
    dispatch({ type: 'start', room: nextGame(board.room) });
  };

  if (!board) return <SetupScreen onStart={(room) => dispatch({ type: 'start', room })} />;
  if (board.status === 'finished' || (board.status === 'lost' && lossSeen)) {
    return <ResultScreen board={board} onPlayAgain={playAgain} onNewGame={quit} />;
  }

  // Sounds start in the tap handlers, so a refresh does not replay them.
  const move = (action: BoardAction) => {
    const cue = getBoardCue(board, boardReducer(board, action));
    if (cue) void play(cue);
    dispatch(action);
  };
  const showLoss = () => {
    void play({ type: 'result', tier: getRankTier(board.lit, board.burnt) });
    setLossSeen(true);
  };
  return (
    <BoardScreen
      key={board.room.game}
      board={board}
      dispatch={move}
      onShowResult={showLoss}
      onPlayAgain={playAgain}
      onQuit={quit}
    />
  );
}
