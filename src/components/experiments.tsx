import { useEffect, useMemo, useRef, useState } from 'react';
import type { ExperimentId } from '../data/types';
import { allProjects } from '../lib/content';
import { journal } from '../data/site';
import { makeNoise, mulberry32, useReducedMotion, useTheme } from '../lib/store';
import { palette } from '../lib/palette';
import { rafThrottle } from '../lib/raf';

/** Runs `frame` only while the element is on screen, the tab is visible,
    and the user hasn't asked for reduced motion. */
function useLoop(el: React.RefObject<HTMLElement | null>, running: boolean, frame: () => void) {
  const f = useRef(frame);
  f.current = frame;
  useEffect(() => {
    let visible = true, raf = 0;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    if (el.current) io.observe(el.current);
    const tick = () => {
      raf = 0;
      if (!visible || !running || document.hidden) return;
      f.current();
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
    start();
    document.addEventListener('visibilitychange', start);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', start); cancelAnimationFrame(raf); };
  }, [el, running]);
}

function Frame({ children, controls, hint }: { children: React.ReactNode; controls?: React.ReactNode; hint?: string }) {
  return (
    <div className="exp">
      <div className="exp__stage">{children}</div>
      <div className="exp__bar mono">
        {hint && <span className="exp__hint">{hint}</span>}
        <div className="exp__ctrls">{controls}</div>
      </div>
    </div>
  );
}

/* ───────── 1. Flowfield Instrument ───────── */
export function FlowField({ compact = false }: { compact?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const theme = useTheme();
  const [run, setRun] = useState(!reduced);
  const [sound, setSound] = useState(false);
  const [seed, setSeed] = useState(1);
  const st = useRef<{ p: Float32Array; n: (x: number, y: number) => number; m: { x: number; y: number; down: boolean; on: boolean }; t: number; speed: number } | null>(null);
  const audio = useRef<{ ctx: AudioContext; o: OscillatorNode; o2: OscillatorNode; g: GainNode; f: BiquadFilterNode } | null>(null);

  useEffect(() => {
    const c = ref.current!;
    const resize = () => { c.width = c.clientWidth * Math.min(1.5, devicePixelRatio); c.height = c.clientHeight * Math.min(1.5, devicePixelRatio); const g = c.getContext('2d')!; g.fillStyle = palette().bg; g.fillRect(0, 0, c.width, c.height); };
    resize();
    const N = Math.min(compact ? 900 : 2600, Math.floor((c.width * c.height) / 380));
    const r = mulberry32(seed);
    const p = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) { p[i * 2] = r() * c.width; p[i * 2 + 1] = r() * c.height; }
    st.current = { p, n: makeNoise(seed), m: { x: 0, y: 0, down: false, on: false }, t: 0, speed: 0 };
    const ro = new ResizeObserver(resize); ro.observe(c);
    return () => ro.disconnect();
  }, [seed, compact, theme]);

  useLoop(ref, run, () => {
    const c = ref.current, s = st.current;
    if (!c || !s) return;
    const g = c.getContext('2d')!;
    const w = c.width, h = c.height;
    const { bg, ink, accent } = palette();
    g.fillStyle = bg; g.globalAlpha = 0.07; g.fillRect(0, 0, w, h); g.globalAlpha = 1;
    s.t += 0.0025;
    let sp = 0;
    const N = s.p.length / 2;
    // two batched paths per frame instead of a fillStyle change per particle
    const body = new Path2D(), sparks = new Path2D();
    for (let i = 0; i < N; i++) {
      let x = s.p[i * 2], y = s.p[i * 2 + 1];
      const a = s.n(x * 0.0022, y * 0.0022 + s.t) * Math.PI * 3;
      let vx = Math.cos(a), vy = Math.sin(a);
      if (s.m.on) {
        const dx = x - s.m.x, dy = y - s.m.y, d2 = dx * dx + dy * dy + 400;
        const f = (s.m.down ? 9000 : 3000) / d2;
        vx += -dy * f * 0.05 + dx * f * 0.01; vy += dx * f * 0.05 + dy * f * 0.01;
      }
      sp += Math.abs(vx) + Math.abs(vy);
      (i % 37 === 0 ? sparks : body).rect(x, y, 1.3, 1.3);
      x += vx * 1.2; y += vy * 1.2;
      if (x < 0 || x > w || y < 0 || y > h) { x = Math.random() * w; y = Math.random() * h; }
      s.p[i * 2] = x; s.p[i * 2 + 1] = y;
    }
    g.fillStyle = ink; g.fill(body);
    g.fillStyle = accent; g.fill(sparks);
    s.speed = sp / N;
    if (audio.current) {
      const { o, o2, f, g: gg, ctx } = audio.current;
      const v = Math.min(3, s.speed);
      o.frequency.setTargetAtTime(110 + v * 60, ctx.currentTime, 0.2);
      o2.frequency.setTargetAtTime(165 + v * 92, ctx.currentTime, 0.3);
      f.frequency.setTargetAtTime(300 + v * 900 + (s.m.down ? 1500 : 0), ctx.currentTime, 0.1);
      gg.gain.setTargetAtTime(0.03 + (s.m.on ? 0.03 : 0), ctx.currentTime, 0.2);
    }
  });

  const toggleSound = async () => {
    if (audio.current) { audio.current.g.gain.setTargetAtTime(0, audio.current.ctx.currentTime, 0.1); const a = audio.current; setTimeout(() => a.ctx.close(), 400); audio.current = null; setSound(false); return; }
    const ctx = new AudioContext();
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    const o2 = ctx.createOscillator(); o2.type = 'triangle';
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 6;
    const g = ctx.createGain(); g.gain.value = 0;
    o.connect(f); o2.connect(f); f.connect(g); g.connect(ctx.destination); o.start(); o2.start();
    audio.current = { ctx, o, o2, g, f };
    setSound(true);
  };
  useEffect(() => () => { audio.current?.ctx.close(); }, []);

  const rect = useRef({ left: 0, top: 0, k: 1 });
  const measure = () => { const c = ref.current; if (!c) return; const r = c.getBoundingClientRect(); rect.current = { left: r.left, top: r.top, k: c.width / r.width }; };
  useEffect(() => { measure(); window.addEventListener('resize', measure, { passive: true }); return () => window.removeEventListener('resize', measure); }, []);
  const pos = rafThrottle((cx: number, cy: number) => {
    const m = st.current?.m; if (!m) return;
    const { left, top, k } = rect.current;
    m.x = (cx - left) * k; m.y = (cy - top) * k; m.on = true;
  });
  return (
    <Frame
      hint={compact ? undefined : 'Move to stir · press & drag for a storm'}
      controls={!compact && <>
        <button type="button" onClick={() => setRun((v) => !v)} aria-pressed={run}>{run ? 'Pause' : 'Play'}</button>
        <button type="button" onClick={() => setSeed((s) => s + 1)}>New weather</button>
        <button type="button" onClick={toggleSound} aria-pressed={sound}>{sound ? 'Sound on' : 'Sound off'}</button>
      </>}
    >
      <canvas
        ref={ref}
        className="exp__canvas"
        aria-label="Interactive particle flow field"
        onPointerMove={(e) => pos(e.clientX, e.clientY)}
        onPointerDown={(e) => { pos(e.clientX, e.clientY); st.current!.m.down = true; }}
        onPointerUp={() => (st.current!.m.down = false)}
        onPointerLeave={() => { st.current!.m.on = false; st.current!.m.down = false; }}
      />
      {!run && <button type="button" className="exp__resume mono" onClick={() => setRun(true)}>▶ Start experiment</button>}
    </Frame>
  );
}

/* ───────── 2. Type Field ───────── */
export function TypeField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [word, setWord] = useState('BEN');
  const reduced = useReducedMotion();
  const [run, setRun] = useState(!reduced);
  const st = useRef<{ pts: { x: number; y: number; tx: number; ty: number; vx: number; vy: number }[]; m: { x: number; y: number; on: boolean } }>({ pts: [], m: { x: -1e4, y: -1e4, on: false } });

  useEffect(() => {
    const c = ref.current!;
    c.width = c.clientWidth * 1.5; c.height = c.clientHeight * 1.5;
    const off = document.createElement('canvas'); off.width = c.width; off.height = c.height;
    const o = off.getContext('2d')!;
    const text = (word || ' ').toUpperCase().slice(0, 12);
    let fs = c.height * 0.62;
    o.font = `800 ${fs}px "Archivo", sans-serif`;
    const tw = o.measureText(text).width;
    if (tw > c.width * 0.9) fs *= (c.width * 0.9) / tw;
    o.font = `800 ${fs}px "Archivo", sans-serif`; o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillStyle = '#000';
    o.fillText(text, c.width / 2, c.height / 2);
    const d = o.getImageData(0, 0, c.width, c.height).data;
    const step = Math.max(4, Math.round(fs / 40));
    const old = st.current.pts;
    const pts: typeof old = [];
    for (let y = 0; y < c.height; y += step) for (let x = 0; x < c.width; x += step) {
      if (d[(y * c.width + x) * 4 + 3] > 128) {
        const prev = old[pts.length];
        pts.push({ x: prev?.x ?? Math.random() * c.width, y: prev?.y ?? Math.random() * c.height, tx: x, ty: y, vx: 0, vy: 0 });
      }
    }
    st.current.pts = pts;
  }, [word]);

  useLoop(ref, run, () => {
    const c = ref.current!;
    const g = c.getContext('2d')!;
    g.clearRect(0, 0, c.width, c.height);
    const { ink, accent } = palette();
    const { pts, m } = st.current;
    const body = new Path2D(), hot = new Path2D();
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const dx = p.x - m.x, dy = p.y - m.y, d2 = dx * dx + dy * dy;
      if (m.on && d2 < 14000) { const f = (14000 - d2) / 14000 * 6; const d = Math.sqrt(d2) || 1; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
      p.vx += (p.tx - p.x) * 0.045; p.vy += (p.ty - p.y) * 0.045;
      p.vx *= 0.84; p.vy *= 0.84; p.x += p.vx; p.y += p.vy;
      (Math.abs(p.vx) + Math.abs(p.vy) > 3 ? hot : body).rect(p.x, p.y, 2.6, 2.6);
    }
    g.fillStyle = ink; g.fill(body);
    g.fillStyle = accent; g.fill(hot);
  });

  return (
    <Frame
      hint="Push the letters around"
      controls={<>
        <label className="exp__input"><span>Word</span><input value={word} maxLength={12} onChange={(e) => setWord(e.target.value)} aria-label="Word to render as particles" /></label>
        <button type="button" onClick={() => setRun((v) => !v)} aria-pressed={run}>{run ? 'Pause' : 'Play'}</button>
      </>}
    >
      <canvas
        ref={ref}
        className="exp__canvas"
        aria-label={`Particle typography spelling ${word}`}
        onPointerMove={rafThrottle((e: React.PointerEvent) => { const c = ref.current; if (!c) return; const r = c.getBoundingClientRect(); st.current.m = { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.width / r.width), on: true }; })}
        onPointerLeave={() => (st.current.m.on = false)}
      />
      {!run && <button type="button" className="exp__resume mono" onClick={() => setRun(true)}>▶ Start experiment</button>}
    </Frame>
  );
}

/* ───────── 3. Interference (raw WebGL) ───────── */
const FRAG = `precision mediump float;
uniform vec2 u_res; uniform vec2 u_mouse; uniform float u_time; uniform vec3 u_ink; uniform vec3 u_bg; uniform vec3 u_acc;
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*u_res)/u_res.y;
  vec2 m=(u_mouse-.5*u_res)/u_res.y;
  float a=sin(length(uv-m)*60.-u_time*2.);
  float b=sin(length(uv+m)*58.+u_time*1.6);
  float c=sin((uv.x+uv.y)*40.+u_time);
  float v=smoothstep(-.2,.2,a*b);
  vec3 col=mix(u_bg,u_ink,v);
  col=mix(col,u_acc,smoothstep(.85,1.,a*b*c)*.9);
  gl_FragColor=vec4(col,1.);
}`;
const hex = (h: string) => { const m = h.replace('#', ''); const n = parseInt(m.length === 3 ? m.split('').map((x) => x + x).join('') : m, 16); return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };

export function Shader() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const theme = useTheme();
  const [run, setRun] = useState(!reduced);
  const [fail, setFail] = useState(false);
  const gl = useRef<{ g: WebGLRenderingContext; u: Record<string, WebGLUniformLocation | null>; t0: number; m: [number, number] } | null>(null);

  useEffect(() => {
    const c = ref.current!;
    const g = c.getContext('webgl', { antialias: false });
    if (!g) { setFail(true); return; }
    const sh = (type: number, src: string) => { const s = g.createShader(type)!; g.shaderSource(s, src); g.compileShader(s); return s; };
    const pr = g.createProgram()!;
    g.attachShader(pr, sh(g.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
    g.attachShader(pr, sh(g.FRAGMENT_SHADER, FRAG));
    g.linkProgram(pr);
    if (!g.getProgramParameter(pr, g.LINK_STATUS)) { setFail(true); return; }
    g.useProgram(pr);
    const buf = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(pr, 'p'); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const u = Object.fromEntries(['u_res', 'u_mouse', 'u_time', 'u_ink', 'u_bg', 'u_acc'].map((n) => [n, g.getUniformLocation(pr, n)]));
    gl.current = { g, u, t0: performance.now(), m: [c.width * 0.6, c.height * 0.5] };
  }, []);

  useLoop(ref, run && !fail, () => {
    const s = gl.current, c = ref.current!;
    if (!s) return;
    const w = c.clientWidth, h = c.clientHeight;
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    const { g, u } = s;
    g.viewport(0, 0, w, h);
    g.uniform2f(u.u_res, w, h); g.uniform2f(u.u_mouse, s.m[0], s.m[1]);
    g.uniform1f(u.u_time, (performance.now() - s.t0) / 1000);
    const pal = palette();
    g.uniform3fv(u.u_ink, hex(pal.ink)); g.uniform3fv(u.u_bg, hex(pal.bg)); g.uniform3fv(u.u_acc, hex(pal.accent));
    g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
  });
  useEffect(() => { /* re-read theme colours */ }, [theme]);

  return (
    <Frame hint="Move the cursor to move the two wave sources" controls={<button type="button" onClick={() => setRun((v) => !v)} aria-pressed={run}>{run ? 'Pause' : 'Play'}</button>}>
      {fail ? <p className="exp__fail mono">WebGL is unavailable in this browser — the rest of the archive works without it.</p> : (
        <canvas ref={ref} className="exp__canvas" aria-label="WebGL interference pattern" onPointerMove={rafThrottle((e: React.PointerEvent) => { const c = ref.current; if (!c || !gl.current) return; const r = c.getBoundingClientRect(); gl.current.m = [e.clientX - r.left, r.height - (e.clientY - r.top)]; })} />
      )}
      {!run && !fail && <button type="button" className="exp__resume mono" onClick={() => setRun(true)}>▶ Start experiment</button>}
    </Frame>
  );
}

/* ───────── 4. Markov text model ───────── */
export function Markov() {
  const corpus = useMemo(() => [...allProjects.map((p) => `${p.description} ${p.body}`), ...journal.map((j) => j.body)].join(' ').replace(/[#*`>\-[\]()]/g, ' ').replace(/\s+/g, ' ').toLowerCase(), []);
  const [order, setOrder] = useState(4);
  const [temp, setTemp] = useState(1);
  const [out, setOut] = useState('');
  const model = useMemo(() => {
    const m = new Map<string, Map<string, number>>();
    for (let i = 0; i < corpus.length - order; i++) {
      const k = corpus.slice(i, i + order), n = corpus[i + order];
      const e = m.get(k) ?? new Map(); e.set(n, (e.get(n) ?? 0) + 1); m.set(k, e);
    }
    return m;
  }, [corpus, order]);
  const generate = () => {
    const keys = [...model.keys()].filter((k) => k.startsWith(' ') || k[0] === 't');
    let s = keys[Math.floor(Math.random() * keys.length)];
    for (let i = 0; i < 320; i++) {
      const e = model.get(s.slice(-order));
      if (!e) break;
      const entries = [...e.entries()].map(([c, w]) => [c, Math.pow(w, 1 / temp)] as const);
      let r = Math.random() * entries.reduce((a, [, w]) => a + w, 0);
      for (const [c, w] of entries) { r -= w; if (r <= 0) { s += c; break; } }
    }
    setOut(s.trim());
  };
  useEffect(generate, [model, temp]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Frame
      hint={`Trained in-browser on ${corpus.length.toLocaleString()} characters of this archive · ${model.size.toLocaleString()} contexts`}
      controls={<>
        <label className="exp__input"><span>Order {order}</span><input type="range" min={2} max={7} value={order} onChange={(e) => setOrder(+e.target.value)} aria-label="Context length" /></label>
        <label className="exp__input"><span>Temp {temp.toFixed(1)}</span><input type="range" min={0.3} max={3} step={0.1} value={temp} onChange={(e) => setTemp(+e.target.value)} aria-label="Sampling temperature" /></label>
        <button type="button" onClick={generate}>Sample again</button>
      </>}
    >
      <div className="markov"><p className="serif" aria-live="polite">{out}<span className="caret" /></p></div>
    </Frame>
  );
}

/* ───────── 5. Password entropy estimator ───────── */
const COMMON = ['password', '123456', 'qwerty', 'letmein', 'admin', 'welcome', 'iloveyou', 'monkey', 'dragon', 'abc123', 'root', 'test'];
export function Entropy() {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const a = useMemo(() => {
    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/\d/.test(pw)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
    let bits = pw.length * Math.log2(pool || 1);
    const flags: string[] = [];
    const low = pw.toLowerCase();
    if (COMMON.some((c) => low.includes(c))) { bits = Math.min(bits, 12); flags.push('contains a very common password'); }
    if (/(.)\1{2,}/.test(pw)) { bits *= 0.75; flags.push('repeated characters'); }
    if (/(0123|1234|2345|3456|4567|5678|6789|abcd|qwer)/i.test(pw)) { bits *= 0.7; flags.push('keyboard / number sequence'); }
    if (/^[A-Z]?[a-z]+\d{1,4}[!@#$]?$/.test(pw)) { bits *= 0.7; flags.push('word + digits pattern'); }
    if (pw.length && pw.length < 10) flags.push('shorter than 10 characters');
    const secs = Math.pow(2, bits) / 1e10 / 2; // offline attack @ 10 billion guesses / s, average case
    const human = secs < 1 ? 'instantly' : secs < 3600 ? `${Math.round(secs / 60) || 1} min` : secs < 86400 * 365 ? `${Math.round(secs / 86400) || 1} days` : secs < 3.15e7 * 1e6 ? `${Math.round(secs / 3.15e7).toLocaleString()} years` : 'longer than civilisation';
    return { bits: Math.round(bits), pool, flags, human };
  }, [pw]);
  const pct = Math.min(100, (a.bits / 100) * 100);
  return (
    <Frame hint="Runs locally — nothing is stored or transmitted" controls={<button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show}>{show ? 'Hide' : 'Show'}</button>}>
      <div className="entropy">
        <label className="entropy__field">
          <span className="mono">Test a passphrase (use a made-up one)</span>
          <input type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="off" spellCheck={false} placeholder="e.g. correct horse battery staple" />
        </label>
        <div className="entropy__meter" aria-hidden><span style={{ width: `${pct}%` }} /></div>
        <dl className="entropy__stats mono">
          <div><dt>Estimated entropy</dt><dd>{a.bits} bits</dd></div>
          <div><dt>Character pool</dt><dd>{a.pool}</dd></div>
          <div><dt>Offline guess time*</dt><dd>{pw ? a.human : '—'}</dd></div>
        </dl>
        <ul className="entropy__flags mono" aria-live="polite">{a.flags.map((f) => <li key={f}>⚠ {f}</li>)}</ul>
        <p className="mono entropy__fine">* Rough educational model: 10¹⁰ guesses/s against a fast hash. Real attacks use dictionaries and are smarter — use a password manager and long random passphrases.</p>
      </div>
    </Frame>
  );
}

export function Experiment({ id }: { id: ExperimentId }) {
  switch (id) {
    case 'flowfield': return <FlowField />;
    case 'typefield': return <TypeField />;
    case 'shader': return <Shader />;
    case 'markov': return <Markov />;
    case 'entropy': return <Entropy />;
  }
}
