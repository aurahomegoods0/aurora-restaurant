import type { CSSProperties } from 'react';

export const INK = '#2b1f10';
export const INK_SOFT = 'rgba(43, 31, 16, 0.72)';
export const GOLD_INK = '#8a6a14';

/** Thin double gold keyline printed on every paper page. */
export function PageFrame({ inset = 14 }: { inset?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute" style={{ inset }}>
      <div className="absolute inset-0 border border-[#b8923a]/55" />
      <div className="absolute inset-[3px] border border-[#b8923a]/25" />
      {[
        'left-[-1px] top-[-1px] border-l-2 border-t-2',
        'right-[-1px] top-[-1px] border-r-2 border-t-2',
        'bottom-[-1px] left-[-1px] border-b-2 border-l-2',
        'bottom-[-1px] right-[-1px] border-b-2 border-r-2',
      ].map((corner) => (
        <span
          key={corner}
          className={`absolute h-3 w-3 border-[#a8801e] ${corner}`}
        />
      ))}
    </div>
  );
}

export function GoldDivider({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center gap-2 ${className ?? ''}`}
      style={style}
    >
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#b8923a]" />
      <span className="h-1.5 w-1.5 rotate-45 bg-[#b8923a]" />
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#b8923a]" />
    </div>
  );
}

/** Aurora borealis emblem: three flowing ribbons under a star. */
export function AuroraEmblem({
  size = 96,
  variant = 'gold',
}: {
  size?: number;
  variant?: 'gold' | 'ink';
}) {
  const id = variant === 'gold' ? 'aurora-emblem-gold' : 'aurora-emblem-ink';
  const stops =
    variant === 'gold'
      ? ['#7a5a14', '#fff3b8', '#b8923a']
      : ['#6b5116', '#b8923a', '#6b5116'];
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className="shrink-0"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={stops[0]} />
          <stop offset="0.5" stopColor={stops[1]} />
          <stop offset="1" stopColor={stops[2]} />
        </linearGradient>
      </defs>
      <g stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round">
        <path d="M8 74 C 26 44, 40 82, 54 52 S 80 40, 92 58" />
        <path d="M14 84 C 30 58, 44 90, 58 64 S 82 54, 90 70" opacity="0.7" />
        <path d="M22 92 C 36 72, 48 96, 60 76 S 80 70, 86 80" opacity="0.4" />
      </g>
      <path
        d="M50 8 L53 18 L63 21 L53 24 L50 34 L47 24 L37 21 L47 18 Z"
        fill={`url(#${id})`}
      />
    </svg>
  );
}

export function WineGlassIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 3h8l1 6a5 5 0 0 1-10 0z" />
      <path d="M12 14v7M8.5 21h7" />
      <path d="M7.4 8.5h9.2" opacity="0.6" />
    </svg>
  );
}
