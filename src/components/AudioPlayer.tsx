import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioRelease, Track } from '../data/types';
import { isImage } from '../lib/content';
import { loadFile, peaks, renderRecipe } from '../lib/synth';
import { useTheme } from '../lib/store';
import { Generative, Picture } from './Cover';

const fmt = (s: number) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '–:––');
const cssVar = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

async function resolve(t: { src?: string; synth?: Track['synth'] }) {
  if (t.src) return loadFile(t.src);
  if (t.synth) return renderRecipe(t.synth);
  throw new Error('Track has neither src nor synth');
}

function drawWave(c: HTMLCanvasElement, pk: Float32Array | null, progress: number, track?: Track, duration = 0, compact = false) {
  const dpr = Math.min(2, devicePixelRatio);
  const w = (c.width = c.clientWidth * dpr), h = (c.height = c.clientHeight * dpr);
  const g = c.getContext('2d')!;
  g.clearRect(0, 0, w, h);
  const ink = cssVar('--ink-3'), acc = cssVar('--accent'), line = cssVar('--line-2');
  if (!pk) {
    g.fillStyle = line;
    for (let i = 0; i < 120; i++) g.fillRect((i / 120) * w, h / 2 - 1, w / 240, 2);
    return;
  }
  const n = pk.length, bw = w / n;
  for (let i = 0; i < n; i++) {
    const v = Math.max(0.02, pk[i]) * h * (compact ? 0.9 : 0.8);
    g.fillStyle = i / n < progress ? acc : ink;
    g.fillRect(i * bw, (h - v) / 2, Math.max(1, bw * 0.6), v);
  }
  if (track && duration && !compact) {
    g.font = `${10 * dpr}px "JetBrains Mono", monospace`;
    track.markers?.forEach((m) => {
      const x = (m.time / duration) * w;
      g.fillStyle = cssVar('--ink'); g.fillRect(x, 0, dpr, h);
      g.fillText(m.label.toUpperCase(), x + 4 * dpr, 11 * dpr);
    });
    track.annotations?.forEach((a) => {
      const x = (a.time / duration) * w;
      g.fillStyle = acc; g.beginPath(); g.arc(x, h - 5 * dpr, 3.5 * dpr, 0, 7); g.fill();
    });
  }
}

function Stems({ track, progress }: { track: Track; progress: number }) {
  const [data, setData] = useState<(Float32Array | null)[]>([]);
  const refs = useRef<(HTMLCanvasElement | null)[]>([]);
  const theme = useTheme();
  useEffect(() => {
    let alive = true;
    Promise.all((track.stems ?? []).map((s) => resolve(s).then((r) => (r.buffer ? peaks(r.buffer, 300) : null)))).then((d) => alive && setData(d));
    return () => { alive = false; };
  }, [track]);
  useEffect(() => { refs.current.forEach((c, i) => c && drawWave(c, data[i] ?? null, progress, undefined, 0, true)); }, [data, progress, theme]);
  return (
    <div className="stems">
      {track.stems!.map((s, i) => (
        <div className="stems__lane" key={s.name}>
          <span className="mono">{String(i + 1).padStart(2, '0')} {s.name}</span>
          <canvas ref={(el) => { refs.current[i] = el; }} aria-label={`${s.name} stem waveform`} />
        </div>
      ))}
    </div>
  );
}

export function AudioPlayer({ release, title }: { release: AudioRelease; title: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const wave = useRef<HTMLCanvasElement>(null);
  const spec = useRef<HTMLCanvasElement>(null);
  const graph = useRef<{ ctx: AudioContext; an: AnalyserNode } | null>(null);
  const [ti, setTi] = useState(0);
  const [pk, setPk] = useState<Float32Array | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(0.8);
  const [rate, setRate] = useState(1);
  const [view, setView] = useState<'wave' | 'spectrogram' | 'stems'>('wave');
  const [error, setError] = useState('');
  const theme = useTheme();
  const track = release.tracks[ti];
  const pendingPlay = useRef(false);

  // load the selected track
  useEffect(() => {
    let alive = true;
    setLoading(true); setPk(null); setError(''); setTime(0);
    resolve(track)
      .then(({ url, buffer }) => {
        if (!alive || !audio.current) return;
        audio.current.src = url;
        audio.current.playbackRate = rate;
        if (buffer) { setPk(peaks(buffer, 420)); setDur(buffer.duration); }
        setLoading(false);
        loadingRef.current = false;
        if (pendingPlay.current) { pendingPlay.current = false; void play(true); }
      })
      .catch(() => alive && (setError('Audio could not be loaded.'), setLoading(false)));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ti]);

  useEffect(() => { if (wave.current) drawWave(wave.current, pk, dur ? time / dur : 0, track, dur); }, [pk, time, dur, track, theme, view]);
  useEffect(() => { if (audio.current) audio.current.volume = vol; }, [vol]);
  useEffect(() => { if (audio.current) audio.current.playbackRate = rate; }, [rate]);

  // one player at a time across the site
  useEffect(() => {
    const on = (e: Event) => { if ((e as CustomEvent).detail !== audio.current) audio.current?.pause(); };
    window.addEventListener('oib:play', on);
    return () => window.removeEventListener('oib:play', on);
  }, []);

  const ensureGraph = () => {
    if (graph.current || !audio.current) return;
    try {
      const ctx = new AudioContext();
      const srcNode = ctx.createMediaElementSource(audio.current);
      const an = ctx.createAnalyser(); an.fftSize = 1024; an.smoothingTimeConstant = 0.6;
      srcNode.connect(an); an.connect(ctx.destination);
      graph.current = { ctx, an };
    } catch { /* analyser unavailable — playback still works */ }
  };

  const loadingRef = useRef(true);
  loadingRef.current = loading;
  const play = useCallback(async (force = false) => {
    const a = audio.current;
    if (!a) return;
    if (loadingRef.current && !force) { pendingPlay.current = true; return; }
    ensureGraph();
    await graph.current?.ctx.resume();
    window.dispatchEvent(new CustomEvent('oib:play', { detail: a }));
    await a.play().catch(() => setError('Playback was blocked by the browser.'));
  }, []);
  const toggle = () => (audio.current?.paused ? play() : audio.current?.pause());
  const seek = (t: number) => { if (audio.current && dur) audio.current.currentTime = Math.max(0, Math.min(dur - 0.05, t)); setTime(audio.current?.currentTime ?? 0); };
  const select = (i: number, autoplay = true) => { if (i === ti) { toggle(); return; } pendingPlay.current = autoplay; setTi(i); };

  // spectrogram loop
  useEffect(() => {
    if (view !== 'spectrogram' || !playing) return;
    const c = spec.current!;
    const g = c.getContext('2d')!;
    let raf = 0;
    const dpr = Math.min(2, devicePixelRatio);
    if (c.width !== c.clientWidth * dpr) { c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr; g.fillStyle = cssVar('--bg-2'); g.fillRect(0, 0, c.width, c.height); }
    const acc = cssVar('--accent');
    const loop = () => {
      const an = graph.current?.an;
      if (an && c.width && c.height) {
        const bins = new Uint8Array(an.frequencyBinCount);
        an.getByteFrequencyData(bins);
        g.drawImage(c, -2, 0);
        const h = c.height;
        for (let y = 0; y < h; y++) {
          const idx = Math.floor(Math.pow(1 - y / h, 2.2) * bins.length * 0.7);
          const v = bins[idx] / 255;
          g.fillStyle = cssVar('--bg-2'); g.globalAlpha = 1; g.fillRect(c.width - 2, y, 2, 1);
          g.globalAlpha = v; g.fillStyle = v > 0.72 ? acc : cssVar('--ink'); g.fillRect(c.width - 2, y, 2, 1);
        }
        g.globalAlpha = 1;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [view, playing, theme]);

  const onWaveKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { seek(time + 5); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { seek(time - 5); e.preventDefault(); }
    else if (e.key === 'Home') seek(0);
    else if (e.key === 'End') seek(dur);
    else if (e.key === ' ' || e.key === 'Enter') { toggle(); e.preventDefault(); }
  };
  const waveSeek = (e: React.PointerEvent) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * dur); };

  const activeNote = track.annotations?.filter((a) => time >= a.time && time < a.time + 6).pop();
  const art = release.artwork;

  return (
    <section className="player" aria-label={`Audio player — ${title}`}>
      <div className="player__art">
        {art ? (isImage(art) ? <Picture image={art} sizes="320px" /> : <Generative cover={art} />) : <Generative cover={{ generative: 'bars', seed: title.length }} />}
        <span className="player__fmt mono">{release.format.replace('-', ' ')} · {release.tracks.length} {release.tracks.length === 1 ? 'track' : 'tracks'}</span>
      </div>

      <div className="player__main">
        <div className="player__head">
          <button type="button" className={`player__play ${playing ? 'is-playing' : ''}`} onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} disabled={!!error && !pk}>
            {loading && pendingPlay.current ? <span className="spin" /> : playing ? <svg viewBox="0 0 24 24" aria-hidden><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg> : <svg viewBox="0 0 24 24" aria-hidden><path d="M7 4.5v15l12-7.5z" /></svg>}
          </button>
          <div className="player__title">
            <span className="mono player__no">{String(ti + 1).padStart(2, '0')} — {title}</span>
            <strong className="serif">{track.title}</strong>
          </div>
          <span className="mono player__time" aria-live="off">{fmt(time)} <i>/</i> {fmt(dur)}</span>
        </div>

        <div className="player__views mono" role="tablist" aria-label="Visualisation">
          {(['wave', 'spectrogram', ...(track.stems ? ['stems'] : [])] as const).map((v) => (
            <button type="button" role="tab" aria-selected={view === v} key={v} onClick={() => { setView(v as typeof view); if (v === 'spectrogram') ensureGraph(); }}>{v === 'wave' ? 'Waveform' : v === 'stems' ? 'Multitrack' : 'Spectrogram'}</button>
          ))}
          {loading && <span className="player__status">Rendering audio…</span>}
          {error && <span className="player__status is-err">{error}</span>}
        </div>

        <div className="player__vis">
          <canvas
            ref={wave}
            className="player__wave"
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(dur)}
            aria-valuenow={Math.round(time)}
            aria-valuetext={`${fmt(time)} of ${fmt(dur)}`}
            onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); waveSeek(e); }}
            onPointerMove={(e) => e.buttons && waveSeek(e)}
            onKeyDown={onWaveKey}
          />
          {view === 'spectrogram' && (
            <div className="player__specwrap">
              <canvas ref={spec} className="player__spec" aria-label="Live spectrogram" />
              {!playing && <span className="mono player__spechint">Press play to draw the spectrogram</span>}
            </div>
          )}
          {view === 'stems' && track.stems && <Stems track={track} progress={dur ? time / dur : 0} />}
        </div>

        <p className={`player__note mono ${activeNote ? 'is-on' : ''}`} aria-live="polite">{activeNote ? `◆ ${fmt(activeNote.time)} — ${activeNote.text}` : track.annotations?.length ? '◆ Annotations appear here during playback' : ''}</p>

        <div className="player__controls mono">
          <label className="player__vol">
            <span>Vol</span>
            <input type="range" min={0} max={1} step={0.01} value={vol} onChange={(e) => setVol(+e.target.value)} aria-label="Volume" />
          </label>
          {release.allowSpeed && (
            <div className="player__rate" role="group" aria-label="Playback speed">
              {[0.5, 0.75, 1, 1.5].map((r) => <button type="button" key={r} aria-pressed={rate === r} onClick={() => setRate(r)}>{r}×</button>)}
            </div>
          )}
          {track.markers && (
            <div className="player__markers" role="group" aria-label="Sections">
              {track.markers.map((m) => <button type="button" key={m.label} onClick={() => { seek(m.time); if (!playing) void play(); }}>{m.label}</button>)}
            </div>
          )}
        </div>

        <ol className="tracklist">
          {release.tracks.map((t, i) => (
            <li key={t.title} className={i === ti ? 'is-active' : ''}>
              <button type="button" onClick={() => select(i)} aria-current={i === ti}>
                <span className="mono">{i === ti && playing ? '▶' : String(i + 1).padStart(2, '0')}</span>
                <span className="serif">{t.title}</span>
                <span className="mono">{t.synth ? fmt(t.synth.seconds) : ''}</span>
              </button>
            </li>
          ))}
        </ol>
        {track.notes && <p className="player__notes"><span className="mono">Production note —</span> {track.notes}</p>}
      </div>

      <audio
        ref={audio}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => isFinite(e.currentTarget.duration) && setDur(e.currentTarget.duration)}
        onEnded={() => { setPlaying(false); if (ti < release.tracks.length - 1) select(ti + 1); }}
      />
    </section>
  );
}
