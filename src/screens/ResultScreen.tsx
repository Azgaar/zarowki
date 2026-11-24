import { Bulb } from '../components/Bulb';
import { Button } from '../components/Button';
import { getRankTier, type BoardState } from '../game/board';
import { useLocale } from '../locales';

interface Props {
  board: BoardState;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export function ResultScreen({ board, onPlayAgain, onNewGame }: Props) {
  const { t } = useLocale();
  const { lit, burnt } = board;
  const rank = t.rank[getRankTier(lit, burnt)];
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-6 p-5 text-center">
      <h1 className="text-5xl font-black text-balance text-amber lg:text-7xl">{rank.title}</h1>
      <div className="flex flex-wrap justify-center gap-1" role="img"
        aria-label={`${t.lampsCount(lit)}. ${t.burntCount(burnt)}`}>
        {Array.from({ length: lit + burnt }, (_, i) => <Bulb key={i} lit={i < lit} className="h-12" />)}
      </div>
      <p className="text-xl lg:text-3xl">{rank.text}</p>
      <div className="flex w-full flex-col gap-3">
        <Button tone="primary" className="min-h-16 w-full text-2xl" onClick={onPlayAgain}>{t.newGame.again}</Button>
        <p className="text-base font-medium text-balance">{t.newGame.others}</p>
        <Button tone="dark" className="w-full text-lg" onClick={onNewGame}>{t.newGame.setup}</Button>
      </div>
    </main>
  );
}
