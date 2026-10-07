'use client';

import React from 'react';

interface MarqueeProps {
  items: string[];
  /** Seconds for one full loop */
  duration?: number;
}

/** Endless horizontal ticker — CSS transform only, stays off the main thread. */
const Marquee: React.FC<MarqueeProps> = ({ items, duration = 40 }) => {
  const track = [...items, ...items];

  return (
    <div
      className="relative overflow-hidden border-y border-[#D4AF37]/15 bg-[#0A0A0A]/40 py-3 backdrop-blur-sm [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
      aria-hidden
    >
      <div
        className="hero-marquee flex w-max items-center gap-10 whitespace-nowrap motion-reduce:animate-none"
        style={{ animationDuration: `${duration}s` }}
      >
        {track.map((item, index) => (
          <span
            key={index}
            className="flex items-center gap-10 text-[11px] font-light uppercase tracking-[0.35em] text-[#D4AF37]/70"
          >
            {item}
            <span className="block h-1.5 w-1.5 rotate-45 bg-[#D4AF37]/50" />
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
