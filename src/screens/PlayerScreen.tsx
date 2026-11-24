import { useState } from 'react';
import { play } from '../audio/play';
import { Button } from '../components/Button';
import { GameFooter } from '../components/GameFooter';
import { PeekCard } from '../components/PeekCard';
import { PromptCard } from '../components/PromptCard';
import { RoleBar } from '../components/RoleBar';
import { isInteger } from '../game/isInteger';
import { nextGame, roomKey, seatHostFirst, tableKey } from '../game/room';
import { dealRound } from '../game/seededDeal';
import { load, loadSeat, save } from '../game/storage';
import { ROUNDS, type Room } from '../game/types';
import { useLocale } from '../locales';
import { JoinScreen } from './JoinScreen';

interface Props {
  room: Room;
  onRoomChange: (room: Room) => void;
}

/** Render with key={roomKey(room)}, so that each game has its own round. */
export function PlayerScreen({ room, onRoomChange }: Props) {
  const { t } = useLocale();
  const seatKey = `seat:${tableKey(room)}`;
  const roundKey = `round:${roomKey(room)}`;
  const [seat, setSeat] = useState(() => loadSeat(seatKey, room.names.length));
  const [round, setRound] = useState<number>(() => {
    const saved = load(roundKey);
    return isInteger(saved, 1, ROUNDS) ? saved : 1;
  });

  const pickSeat = (next: number) => {
    save(seatKey, next);
    setSeat(next);
  };
  const pickRound = (next: number) => {
    if (next === round) return;
    // The whole table hears which round this phone is on.
    void play({ type: 'round', round: next });
    save(roundKey, next);
    setRound(next);
  };

  // This phone becomes the board: no server, so the others scan its new code.
  const startNewGame = () => {
    if (seat === null) return;
    const { complexity, ratings } = room;
    save('setup', { ...seatHostFirst(room, seat), complexity, ratings });
    save('board', null);
    window.location.assign(import.meta.env.BASE_URL);
  };

  if (seat === null) return <JoinScreen names={room.names} onJoin={pickSeat} />;

  return (
    <main className="mx-auto grid h-dvh max-w-md lg:max-w-3xl grid-rows-[auto_minmax(9rem,1fr)_auto] gap-x-3 overflow-y-auto p-4 compact:px-3 compact:pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] short:max-w-5xl short:grid-cols-2 short:grid-rows-[1fr_auto]">
      <div className="flex flex-col gap-3 compact:gap-2 short:my-auto">
        <RoleBar room={room} round={round} seat={seat} />
        {room.game > 1 && <p className="text-center text-base font-extrabold">{t.game(room.game)}</p>}
        <div className="grid grid-cols-5 gap-2" role="group" aria-label={t.roundPills}>
          {Array.from({ length: ROUNDS }, (_, i) => i + 1).map((r) => (
            <Button key={r} tone={r === round ? 'primary' : 'dark'} className="min-h-11 px-0 text-xl" aria-pressed={r === round}
              onClick={() => pickRound(r)}>
              {r}
            </Button>
          ))}
        </div>
        <PromptCard key={round} room={room} round={round} />
      </div>
      <PeekCard key={`peek-${round}`} value={dealRound(room, round).get(seat)} className="mt-3 w-full compact:mt-2 short:col-start-2 short:row-span-2 short:row-start-1 short:mt-0 short:mb-2" />
      <GameFooter className="mt-1 short:mt-0" hint={t.newGame.player} onPlayAgain={() => onRoomChange(nextGame(room))} onNewGame={startNewGame} />
    </main>
  );
}
