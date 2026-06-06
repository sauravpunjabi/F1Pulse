/* ───────────────────────────────────────────────────────────────────────────
   ds-primitives.jsx — shared animation primitives for the driver story.
   Exports to window: useInView, useScrollProgress, useReducedMotion, useMotion,
   CountUp, SplitReveal, TelemetryTrace, Grain, RevealLine, Magnetic.
   ─────────────────────────────────────────────────────────────────────────── */
const { useState, useEffect, useRef, useCallback } = React;

/* Global motion scale (driven by Tweaks). 1 = normal, <1 faster, >1 slower. */
window.__motionScale = window.__motionScale ?? 1;
function useMotion() {
  // re-render hook when motion scale changes via custom event
  const [, force] = useState(0);
  useEffect(() => {
    const h = () => force((n) => n + 1);
    window.addEventListener('ds-motion', h);
    return () => window.removeEventListener('ds-motion', h);
  }, []);
  return window.__motionScale;
}

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setR(m.matches);
    const h = () => setR(m.matches);
    m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, []);
  return r;
}

/* Fires once when element enters viewport. */
function useInView(opts = {}) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: opts.threshold ?? 0.25, rootMargin: opts.rootMargin ?? '0px 0px -10% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

/* Returns 0..1 progress of an element across the viewport (for scroll-driven fx). */
function useScrollProgress(opts = {}) {
  const ref = useRef(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const compute = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when top of el hits bottom of viewport; 1 when bottom of el hits top
      const total = r.height + vh;
      const passed = vh - r.top;
      setP(Math.max(0, Math.min(1, passed / total)));
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return [ref, p];
}

const easeOutExpo = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

/* Animated number rollup, fires on viewport enter. */
function CountUp({ to, from = 0, duration = 2.0, decimals = 0, prefix = '', suffix = '', className, style }) {
  const [ref, seen] = useInView({ threshold: 0.4 });
  const [val, setVal] = useState(from);
  const reduced = useReducedMotion();
  const motion = useMotion();
  useEffect(() => {
    if (!seen) return;
    if (reduced) { setVal(to); return; }
    const dur = duration * 1000 * motion;
    let start;
    let raf;
    const tick = (t) => {
      if (start === undefined) start = t;
      const k = Math.min(1, (t - start) / dur);
      setVal(from + (to - from) * easeOutExpo(k));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen]);
  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString('en-US');
  return <span ref={ref} className={className} style={style}>{prefix}{display}{suffix}</span>;
}

/* Kinetic per-character reveal. Each glyph rises + unblurs in sequence. */
function SplitReveal({ text, className, style, delay = 0, stagger = 0.04, trigger = 'mount', as = 'span' }) {
  const [ref, seen] = useInView({ threshold: 0.3 });
  const reduced = useReducedMotion();
  const motion = useMotion();
  const fire = trigger === 'scroll' ? seen : true;
  const Tag = as;
  const chars = String(text).split('');
  return (
    <Tag ref={ref} className={className} style={{ display: 'inline-block', ...style }} aria-label={text}>
      {chars.map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            display: 'inline-block',
            whiteSpace: 'pre',
            transform: fire ? 'translateY(0) rotate(0)' : 'translateY(0.9em) rotate(3deg)',
            opacity: fire ? 1 : 0,
            filter: fire ? 'blur(0)' : 'blur(8px)',
            transition: reduced
              ? 'none'
              : `transform ${0.7 * motion}s cubic-bezier(0.16,1,0.3,1) ${(delay + i * stagger) * motion}s, opacity ${0.6 * motion}s ease ${(delay + i * stagger) * motion}s, filter ${0.6 * motion}s ease ${(delay + i * stagger) * motion}s`,
          }}
        >
          {c}
        </span>
      ))}
    </Tag>
  );
}

/* Self-drawing SVG polyline — a stylised qualifying telemetry trace. */
function TelemetryTrace({ points, width = 1000, height = 200, stroke = 'currentColor', strokeWidth = 2, fill = 'none', glow = false, className, style, trigger = 'scroll', duration = 2.0 }) {
  const [ref, seen] = useInView({ threshold: 0.3 });
  const reduced = useReducedMotion();
  const motion = useMotion();
  const fire = trigger === 'mount' ? true : seen;
  const n = points.length;
  const d = points
    .map((v, i) => `${(i / (n - 1)) * width},${height - v * height}`)
    .join(' ');
  const pathRef = useRef(null);
  const [len, setLen] = useState(0);
  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, []);
  return (
    <svg ref={ref} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={className} style={style}>
      {fill !== 'none' && (
        <polygon
          points={`0,${height} ${d} ${width},${height}`}
          fill={fill}
          style={{ opacity: fire ? 1 : 0, transition: `opacity ${1.2 * motion}s ease ${0.5 * motion}s` }}
        />
      )}
      <polyline
        ref={pathRef}
        points={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{
          filter: glow ? 'drop-shadow(0 0 6px currentColor)' : 'none',
          strokeDasharray: len,
          strokeDashoffset: reduced ? 0 : fire ? 0 : len,
          transition: reduced ? 'none' : `stroke-dashoffset ${duration * motion}s cubic-bezier(0.65,0,0.35,1)`,
        }}
      />
    </svg>
  );
}

/* Film grain + vignette atmosphere. Intensity driven by Tweaks. */
function Grain({ grain = 0.06, vignette = 0.35 }) {
  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url("data:image/svg+xml;utf8,' + encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/></filter><rect width="160" height="160" filter="url(%23n)"/></svg>'
        ) + '")',
        backgroundSize: '160px 160px',
        opacity: grain,
        mixBlendMode: 'overlay',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${vignette}) 100%)`,
      }} />
    </div>
  );
}

/* A hairline that draws horizontally on view. */
function RevealLine({ color = 'currentColor', className, style, delay = 0 }) {
  const [ref, seen] = useInView({ threshold: 0.6 });
  const motion = useMotion();
  return (
    <span ref={ref} className={className} style={{ display: 'block', height: 1, background: color, transformOrigin: 'left', transform: `scaleX(${seen ? 1 : 0})`, transition: `transform ${0.9 * motion}s cubic-bezier(0.16,1,0.3,1) ${delay * motion}s`, ...style }} />
  );
}

Object.assign(window, {
  useInView, useScrollProgress, useReducedMotion, useMotion,
  CountUp, SplitReveal, TelemetryTrace, Grain, RevealLine,
});
