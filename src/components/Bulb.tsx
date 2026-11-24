/** Life token: lit, or burnt out with a broken filament. */
export function Bulb({ lit, onAmber = false, className = 'h-6' }: { lit: boolean; onAmber?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 64 68" className={className} aria-hidden stroke="#120D26" strokeWidth="4"
      strokeLinejoin="round" strokeLinecap="round">
      <path d="M32 4a22 22 0 0 0-13 40c2 2 3 4 3 6h20c0-2 1-4 3-6A22 22 0 0 0 32 4Z"
        fill={onAmber ? '#FFF6E3' : lit ? '#FFB627' : '#5A5178'} />
      <path d="M23 52h18v6a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5Z" fill="#FFF6E3" />
      <path d={lit ? 'm24 28 5 6 3-8 3 8 5-6' : 'm24 22 4 6m12-6-4 6M22 36l5-2m15 2-5-2'} fill="none" />
    </svg>
  );
}
