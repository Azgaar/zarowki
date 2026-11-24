import { useEffect, useState } from "react";
import { isInteger } from "../game/isInteger";
import { cleanName } from "../game/names";
import { randomSeed } from "../game/room";
import { load, save } from "../game/storage";
import { COMPLEXITIES, MAX_NAME_LENGTH, MAX_PLAYERS, RATINGS, type Room } from "../game/types";
import { useAppUpdates } from "../update";
import { PlayersStep } from "./PlayersStep";
import { RulesStep, type Setup } from "./RulesStep";

/** Blank slots; the host adds and removes them. */
const NEW_TABLE = ["", "", "", ""];

/** Saved names may be a half-typed draft; the room is only built from valid ones. */
function loadSetup(): Setup {
  const { names, first, complexity, ratings } = load<Partial<Setup>>("setup") ?? {};
  const strings = Array.isArray(names) ? names.filter(n => typeof n === "string") : [];
  const picked = RATINGS.filter(r => Array.isArray(ratings) && ratings.includes(r));
  return {
    names: (strings.length > 0 ? strings : NEW_TABLE).slice(0, MAX_PLAYERS).map(n => n.slice(0, MAX_NAME_LENGTH)),
    first: isInteger(first, 1, MAX_PLAYERS) ? first : 1,
    complexity: COMPLEXITIES.find(c => c === complexity) ?? "normal",
    ratings: picked.length > 0 ? picked : ["family", "fun"]
  };
}

export function SetupScreen({ onStart }: { onStart: (room: Room) => void }) {
  const [step, setStep] = useState<"players" | "rules">("players");
  const [setup, setSetup] = useState<Setup>(loadSetup);
  const change = (patch: Partial<Setup>) => setSetup(s => ({ ...s, ...patch }));
  useEffect(() => save("setup", setup), [setup]);
  useAppUpdates();

  const removeName = (index: number) => {
    const { names, first } = setup;
    const seat = index + 1;
    change({
      names: names.filter((_, i) => i !== index),
      first: seat < first ? first - 1 : seat === first ? 1 : first
    });
  };
  // Drops blank slots; the first guesser follows their name.
  const confirmNames = () => {
    const filled = setup.names.flatMap((n, i) => (cleanName(n) === "" ? [] : [i]));
    change({
      names: filled.map(i => cleanName(setup.names[i]!)),
      first: filled.indexOf(setup.first - 1) + 1 || 1
    });
    setStep("rules");
  };

  if (step === "players") {
    return (
      <PlayersStep
        slots={setup.names}
        onChange={names => change({ names })}
        onRemove={removeName}
        onNext={confirmNames}
      />
    );
  }
  return (
    <RulesStep
      setup={setup}
      onChange={change}
      onBack={() => setStep("players")}
      onStart={() => onStart({ ...setup, seed: randomSeed(), game: 1 })}
    />
  );
}
