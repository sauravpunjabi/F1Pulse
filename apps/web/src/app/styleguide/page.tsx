'use client';

/**
 * /styleguide — Telemetry Masking motion primitives reference.
 *
 * Art-direction reference for tuning all five motion primitives before
 * they go into real pages. Each section shows:
 *   - Component name + import path
 *   - The props currently in use
 *   - A live demo (scroll-triggered or mount)
 *   - Variant comparisons where applicable
 *
 * Delete or gate behind an env flag before production.
 */

import {
  MaskReveal,
  ScanlineReveal,
  CountUp,
  SectionReveal,
  TelemetryLine,
} from '@/components/primitives';

export default function StyleguidePage() {
  return (
    <div className="min-h-dvh bg-black text-off-white">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-nav border-b border-steel bg-black/90 px-8 py-4 backdrop-blur-sm">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-silver">
          F1Pulse · Telemetry Masking Primitives · /styleguide
        </p>
      </header>

      <main className="mx-auto max-w-4xl px-8 pb-40">

        {/* ── 1. MaskReveal ─────────────────────────────────────────────── */}
        <Section
          label="MaskReveal"
          path="@/components/primitives"
          description="Clip-path inset reveal. Direction, preset, delay and trigger are all configurable."
        >
          <div className="grid gap-12">
            <Demo label='direction="left" preset="cinematic" (default)'>
              <MaskReveal direction="left" preset="cinematic" trigger="scroll">
                <DemoBlock>Reveals left → right over 1.2s</DemoBlock>
              </MaskReveal>
            </Demo>

            <Demo label='direction="right" preset="measured"'>
              <MaskReveal direction="right" preset="measured" trigger="scroll">
                <DemoBlock>Reveals right → left over 0.8s</DemoBlock>
              </MaskReveal>
            </Demo>

            <Demo label='direction="top" preset="sharp"'>
              <MaskReveal direction="top" preset="sharp" trigger="scroll">
                <DemoBlock>Reveals top → bottom over 0.4s</DemoBlock>
              </MaskReveal>
            </Demo>

            <Demo label='direction="bottom" delay={0.3} preset="cinematic"'>
              <MaskReveal direction="bottom" delay={0.3} preset="cinematic" trigger="scroll">
                <DemoBlock>Reveals bottom → top, delayed 0.3s</DemoBlock>
              </MaskReveal>
            </Demo>

            <Demo label='trigger="mount" — fires on page load, not scroll'>
              <MaskReveal direction="left" trigger="mount" preset="cinematic">
                <DemoBlock accent>trigger=&quot;mount&quot; — played on render</DemoBlock>
              </MaskReveal>
            </Demo>
          </div>
        </Section>

        {/* ── 2. ScanlineReveal ─────────────────────────────────────────── */}
        <Section
          label="ScanlineReveal"
          path="@/components/primitives"
          description="Accent scanline sweeps across, then content fades in. Used for section headers and stat reveals."
        >
          <div className="grid gap-12">
            <Demo label="default — scanDuration=0.55s, accent line">
              <ScanlineReveal>
                <p className="font-display text-4xl font-semibold text-off-white">
                  Monaco Grand Prix
                </p>
              </ScanlineReveal>
            </Demo>

            <Demo label="scanDuration=1.2 — slower scan, heavier feel">
              <ScanlineReveal scanDuration={1.2}>
                <p className="font-mono text-sm uppercase tracking-[0.4em] text-silver">
                  Round 06 · Circuit de Monaco
                </p>
              </ScanlineReveal>
            </Demo>

            <Demo label="scanDuration=0.3 — fast, sharp">
              <ScanlineReveal scanDuration={0.3}>
                <p className="font-display text-2xl text-off-white">Fastest Lap</p>
              </ScanlineReveal>
            </Demo>

            <Demo label="lineColor='var(--color-silver)' — silver scan">
              <ScanlineReveal lineColor="var(--color-silver)">
                <p className="font-mono text-xs uppercase tracking-[0.5em] text-steel">
                  Constructor Standings
                </p>
              </ScanlineReveal>
            </Demo>
          </div>
        </Section>

        {/* ── 3. CountUp ────────────────────────────────────────────────── */}
        <Section
          label="CountUp"
          path="@/components/primitives"
          description="Animated number rollup using expo-out easing. Triggers on viewport enter."
        >
          <div className="grid gap-12">
            <Demo label="to={314} suffix=' pts' duration={2}">
              <span className="font-display text-6xl font-semibold tabular-nums text-off-white">
                <CountUp to={314} suffix=" pts" duration={2} />
              </span>
            </Demo>

            <Demo label="to={91} suffix=' wins' duration={2.5} — career wins">
              <span className="font-display text-6xl font-semibold tabular-nums text-off-white">
                <CountUp to={91} suffix=" wins" duration={2.5} />
              </span>
            </Demo>

            <Demo label="to={1.234} decimals={3} prefix='+' — lap delta">
              <span className="font-mono text-5xl tabular-nums text-red">
                <CountUp to={1.234} decimals={3} prefix="+" duration={1.8} />
              </span>
            </Demo>

            <Demo label="from={50} to={100} — partial range">
              <span className="font-display text-4xl tabular-nums text-silver">
                <CountUp from={50} to={100} suffix="%" duration={1.5} />
              </span>
            </Demo>
          </div>
        </Section>

        {/* ── 4. SectionReveal ──────────────────────────────────────────── */}
        <Section
          label="SectionReveal"
          path="@/components/primitives"
          description="Staggered entrance for lists and groups. Each direct child animates in sequence."
        >
          <div className="grid gap-16">
            <Demo label="staggerDelay=0.06 preset='measured' (default) — standings list">
              <SectionReveal staggerDelay={0.06} className="grid gap-3">
                {['1. Driver A', '2. Driver B', '3. Driver C', '4. Driver D', '5. Driver E'].map((row) => (
                  <div key={row} className="flex items-center gap-4 border-b border-steel/40 pb-3">
                    <span className="font-mono text-sm text-off-white">{row}</span>
                  </div>
                ))}
              </SectionReveal>
            </Demo>

            <Demo label="staggerDelay=0.12 preset='cinematic' — slower, heavier">
              <SectionReveal staggerDelay={0.12} preset="cinematic" className="flex gap-8">
                {['Practice', 'Qualifying', 'Sprint', 'Race'].map((session) => (
                  <div key={session} className="flex flex-col gap-1">
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.4em] text-silver">
                      {session}
                    </span>
                    <span className="font-display text-2xl text-off-white">—</span>
                  </div>
                ))}
              </SectionReveal>
            </Demo>
          </div>
        </Section>

        {/* ── 5. TelemetryLine ──────────────────────────────────────────── */}
        <Section
          label="TelemetryLine"
          path="@/components/primitives"
          description="SVG polyline that draws itself via pathLength animation. Default path is a circuit trace motif."
        >
          <div className="grid gap-12">
            <Demo label="default path — speed='measured' stroke=var(--accent)">
              <TelemetryLine className="w-full" />
            </Demo>

            <Demo label="speed='cinematic' — 1.2s draw">
              <TelemetryLine speed="cinematic" className="w-full" />
            </Demo>

            <Demo label="speed='sharp' stroke='var(--color-silver)' strokeWidth=0.5">
              <TelemetryLine
                speed="sharp"
                stroke="var(--color-silver)"
                strokeWidth={0.5}
                className="w-full"
              />
            </Demo>

            <Demo label="custom path — simple straight divider">
              <TelemetryLine
                points="0,40 500,40"
                strokeWidth={1}
                speed="measured"
                className="w-full"
              />
            </Demo>

            <Demo label='trigger="mount" — draws on page load'>
              <TelemetryLine trigger="mount" speed="cinematic" className="w-full" />
            </Demo>
          </div>
        </Section>

      </main>
    </div>
  );
}

// ── Local helpers ─────────────────────────────────────────────────────────────

function Section({
  label,
  path,
  description,
  children,
}: {
  label: string;
  path: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-24 border-t border-steel/50 pt-12">
      <div className="mb-10">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.45em] text-steel">
          {path}
        </p>
        <h2 className="mt-1 font-display text-3xl font-semibold text-off-white">
          {'<'}{label}{' />'}
        </h2>
        <p className="mt-2 max-w-lg font-sans text-sm leading-relaxed text-silver">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function Demo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3">
      <p className="font-mono text-[0.6rem] text-steel">{label}</p>
      <div className="rounded border border-steel/30 bg-void p-8">
        {children}
      </div>
    </div>
  );
}

function DemoBlock({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={[
        'flex items-center justify-center rounded px-6 py-8',
        'border font-mono text-sm',
        accent
          ? 'border-red/40 bg-red/5 text-red'
          : 'border-steel/40 bg-graphite text-off-white',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

