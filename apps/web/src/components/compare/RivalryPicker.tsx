'use client';

import Link from 'next/link';

const RIVALRIES = [
  { label: 'SENNA / PROST',           a: 'senna',             b: 'prost' },
  { label: 'HAMILTON / VERSTAPPEN',   a: 'hamilton',          b: 'max_verstappen' },
  { label: 'SCHUMACHER / ALONSO',     a: 'michael_schumacher', b: 'alonso' },
  { label: 'HAMILTON / ROSBERG',      a: 'hamilton',          b: 'rosberg' },
] as const;

interface RivalryPickerProps {
  current?: { a: string; b: string };
}

export function RivalryPicker({ current }: RivalryPickerProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="list"
      aria-label="Famous rivalries"
    >
      {RIVALRIES.map((r) => {
        const isActive = current?.a === r.a && current?.b === r.b;
        return (
          <Link
            key={r.label}
            href={`/compare?a=${r.a}&b=${r.b}`}
            role="listitem"
            className={[
              'font-mono text-[0.6rem] uppercase tracking-[0.2em] px-3 py-1.5 border transition-all',
              isActive
                ? 'border-white/40 text-white/80 bg-white/[0.05]'
                : 'border-white/10 text-white/35 hover:text-white/60 hover:border-white/25',
            ].join(' ')}
          >
            {r.label}
          </Link>
        );
      })}
    </div>
  );
}
