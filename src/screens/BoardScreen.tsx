import { type CSSProperties, useEffect, useState } from "react";
import { Banner } from "../components/Banner";
import { Bulb } from "../components/Bulb";
import { Button } from "../components/Button";
import { FitName } from "../components/FitName";
import { GameFooter } from "../components/GameFooter";
import { heatTextColor } from "../components/heat";
import { HeatColumn } from "../components/HeatColumn";
import { PeekCard } from "../components/PeekCard";
import { PromptCard } from "../components/PromptCard";
import { QrModal } from "../components/QrModal";
import { RoleBar } from "../components/RoleBar";
import { type BoardAction, type BoardState, isRoundComplete } from "../game/board";
import { dealRound, getAnsweringSeats } from "../game/seededDeal";
import { HOST_SEAT, ROUNDS } from "../game/types";
import { useLocale } from "../locales";

interface Props {
  board: BoardState;
  dispatch: (action: BoardAction) => void;
  onShowResult: () => void;
  onPlayAgain: () => void;
  onQuit: () => void;
}

// Stays in view when a big table does not fit on the screen.
const BOTTOM_CARD = "sticky! bottom-2 z-10 w-full short:col-start-2 short:row-span-2 short:row-start-2 short:mb-2";

/** The second tap must come within this time. */
const ARMED_MS = 4000;

/** Fills the rows without leaving a lone tile, and keeps big tables on one phone screen. */
function gridStyle(tiles: number): CSSProperties {
  const columns = tiles <= 3 ? tiles : tiles === 4 ? 2 : 3;
  return {
    "--cols": `repeat(${columns}, minmax(0, 1fr))`,
    "--cols-wide": `repeat(${Math.min(tiles, tiles > 15 ? 6 : 5)}, minmax(0, 1fr))`,
    maxHeight: `${Math.ceil(tiles / columns) * 9}rem`
  } as CSSProperties;
}

export function BoardScreen({ board, dispatch, onShowResult, onPlayAgain, onQuit }: Props) {
  const { t } = useLocale();
  const { room, round, reveals, lit, burnt, status } = board;
  // Opens by itself at the very start, so players can join. They stay joined in the next games.
  const [qrOpen, setQrOpen] = useState(room.game === 1 && round === 1 && reveals.length === 0);
  // A card opens on the second tap, because it cannot be closed again.
  const [armed, setArmed] = useState<number | null>(null);
  useEffect(() => {
    if (armed === null) return;
    const timer = setTimeout(() => setArmed(null), ARMED_MS);
    return () => clearTimeout(timer);
  }, [armed]);
  const tap = (seat: number) => {
    if (seat === armed) dispatch({ type: "reveal", seat });
    setArmed(seat === armed ? null : seat);
  };
  const seats = getAnsweringSeats(room, round);
  const dense = seats.length > 6;
  const denseHeight = `lg:min-h-18 ${seats.length > 9 ? "min-h-12" : "min-h-14"}`;
  const lost = status === "lost";

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-3 p-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] compact:gap-2 compact:px-3 compact:pt-3 short:grid short:grid-cols-2 short:grid-rows-[auto_minmax(3.5rem,1fr)_auto]">
      <div className="flex flex-col gap-3 compact:gap-2 short:row-span-2 short:my-auto">
        <div aria-live="polite">
          {lost || reveals.at(-1)?.penalty ? (
            <Banner>{lost ? t.board.lostTitle : t.board.penalty}</Banner>
          ) : (
            <RoleBar room={room} round={round} seat={HOST_SEAT} />
          )}
        </div>

        <header className="flex items-center justify-between gap-2 text-base font-extrabold lg:text-2xl">
          <span className="whitespace-nowrap">
            {room.game > 1 ? `${t.game(room.game)} · ${round}/${ROUNDS}` : t.board.round(round, ROUNDS)}
          </span>
          <span
            className="flex items-center gap-1 tabular-nums"
            role="img"
            aria-label={`${t.lampsCount(lit)}. ${t.burntCount(burnt)}`}
          >
            <Bulb lit className="h-7 lg:h-9" />
            {lit}
            <Bulb lit={false} className="ml-2 h-7 lg:h-9" />
            {burnt}
          </span>
          <Button
            tone="dark"
            className="min-h-11 min-w-14 text-base"
            aria-label={t.board.showQr}
            onClick={() => setQrOpen(true)}
          >
            {t.board.qr}
          </Button>
        </header>

        <PromptCard key={round} room={room} round={round} />
      </div>

      <div
        className="grid auto-rows-fr lg:flex-1 grid-cols-(--cols) gap-3 compact:gap-2 lg:grid-cols-(--cols-wide) short:col-start-2 short:row-start-1"
        style={gridStyle(seats.length)}
      >
        {seats.map(seat => {
          const name = room.names[seat - 1]!;
          const reveal = reveals.find(r => r.seat === seat);
          if (!reveal) {
            return (
              <Button
                key={seat}
                tone={seat === armed ? "primary" : "dark"}
                className={`px-1 lg:text-3xl ${dense ? `${denseHeight} text-base` : "min-h-[max(4.5rem,12dvh)] text-lg lg:min-h-28 short:min-h-20"}`}
                disabled={lost}
                aria-label={`${seat === armed ? t.board.tapAgain : t.board.closed}: ${name}`}
                onClick={() => tap(seat)}
              >
                <FitName name={name} />
                {seat === armed && <FitName name={t.board.tapAgain} className="text-xs font-medium lg:text-base" />}
              </Button>
            );
          }
          return (
            <div
              key={seat}
              className={`chunky flex flex-col items-center justify-evenly text-ink ${
                dense ? denseHeight : "min-h-[max(4.5rem,12dvh)] sm:p-1 lg:min-h-28 short:min-h-20"
              } ${reveal.penalty ? "bg-ember" : "bg-paper"}`}
            >
              <FitName name={name} className={`px-1 text-xs ${dense ? "lg:text-base" : "lg:text-xl"}`} />
              <span
                className={`leading-none font-black ${dense ? "text-2xl lg:text-4xl" : "text-3xl lg:text-6xl"}`}
                style={{ color: reveal.penalty ? undefined : heatTextColor(reveal.value) }}
              >
                {reveal.value}
              </span>
              {!dense && <HeatColumn value={reveal.value} className="h-5 w-full lg:h-8" />}
            </div>
          );
        })}
      </div>

      {lost || isRoundComplete(board) ? (
        <Button
          tone="primary"
          className={`mt-auto min-h-16 text-2xl short:self-end ${BOTTOM_CARD}`}
          onClick={() => (lost ? onShowResult() : dispatch({ type: "next" }))}
        >
          {lost || round === ROUNDS ? t.board.finish : t.board.next}
        </Button>
      ) : (
        <PeekCard
          key={`peek-${round}`}
          value={dealRound(room, round).get(HOST_SEAT)}
          className={`min-h-13 flex-1 lg:min-h-16 lg:flex-none ${BOTTOM_CARD}`}
        />
      )}

      <GameFooter className="short:col-start-1 short:row-start-3" hint={t.newGame.host} onPlayAgain={onPlayAgain} onNewGame={onQuit} />

      {qrOpen && <QrModal room={room} onClose={() => setQrOpen(false)} />}
    </main>
  );
}
