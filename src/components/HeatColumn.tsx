import { useLocale } from '../locales';
import { HEAT_STEPS } from './heat';

/** Ten bars rising left to right, lit up to the value. */
export function HeatColumn({ value, className = '' }: { value: number; className?: string }) {
  const { t } = useLocale();
  return (
    <svg viewBox="0 0 200 60" className={className} role="img" aria-label={t.intensity(value)}>
      {HEAT_STEPS.map((color, i) => {
        const height = 14 + i * 4.4;
        return (
          <rect key={color} x={2 + i * 20} y={58 - height} width="15" height={height} rx="4"
            fill={i < value ? color : '#4A4078'} stroke="#120D26" strokeWidth="3" />
        );
      })}
    </svg>
  );
}
