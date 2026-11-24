import { getGuesser } from "../game/seededDeal";
import type { Room } from "../game/types";
import { useLocale } from "../locales";
import { FitName } from "./FitName";

/** Who you are and who guesses this round. */
export function RoleBar({ room, round, seat }: { room: Room; round: number; seat: number }) {
  const { t } = useLocale();
  const guesser = getGuesser(room, round);
  const isYou = guesser === seat;
  return (
    <div className="chunky grid min-h-14 grid-cols-2 overflow-hidden text-center">
      <Role label={t.role.you} name={room.names[seat - 1]!} tone="bg-paper text-ink" />
      <Role
        label={isYou ? t.role.youGuess : t.role.guesser}
        name={isYou ? t.role.you : room.names[guesser - 1]!}
        tone={`border-l-3 border-ink ${isYou ? "bg-amber text-ink" : "bg-night-deep"}`}
      />
    </div>
  );
}

function Role({ label, name, tone }: { label: string; name: string; tone: string }) {
  return (
    <div className={`flex min-w-0 flex-col justify-center px-2 leading-tight ${tone}`}>
      <span className="text-xs opacity-75 lg:text-base">{label}</span>
      <FitName name={name} className="text-lg font-extrabold lg:text-2xl" />
    </div>
  );
}
