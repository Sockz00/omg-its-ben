import { useEffect, useRef, useState } from 'react';
import type { VideoAsset } from '../data/types';
import { mediaUrl } from '../lib/content';
import { useReducedMotion } from '../lib/store';
import { Generative, Picture } from './Cover';

/* Real-time generative "films" — no video file required. */
function GenerativeFilm({ program = 'afterimage', playing }: { program?: VideoAsset['program']; playing: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const g = c.getContext('2d')!;
    let raf = 0, t = 0;
    const resize = () => { c.width = c.clientWidth; c.height = c.clientHeight; g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height); };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);
    const frame = () => {
      const { width: w, height: h } = c;
      if (!w || !h) { if (playing) raf = requestAnimationFrame(frame); return; }
      t += 0.016;
      if (program === 'afterimage') {
        // feedback: redraw the previous frame slightly zoomed & rotated, then add new forms
        g.save(); g.globalAlpha = 0.94; g.translate(w / 2, h / 2); g.rotate(0.004); g.scale(1.012, 1.012); g.translate(-w / 2, -h / 2);
        g.drawImage(c, 0, 0); g.restore();
        g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 3; i++) {
          const a = t * (0.7 + i * 0.31) + i * 2;
          const x = w / 2 + Math.cos(a) * w * 0.22 * Math.sin(t * 0.3 + i);
          const y = h / 2 + Math.sin(a * 1.3) * h * 0.25;
          g.strokeStyle = i === 0 ? '#ff4a1c' : i === 1 ? '#efece4' : '#3fd0c9';
          g.lineWidth = 2; g.beginPath(); g.arc(x, y, 18 + 14 * Math.sin(t * 2 + i), 0, Math.PI * 2); g.stroke();
        }
      } else {
        g.fillStyle = '#050505'; g.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 3) { g.fillStyle = `rgba(239,236,228,${0.08 + 0.5 * Math.max(0, Math.sin(y * 0.05 + t * 4))})`; g.fillRect(0, y, w, 1); }
      }
      // scanlines + timecode
      g.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1);
      g.fillStyle = '#efece4'; g.font = '12px "JetBrains Mono", monospace';
      const f = Math.floor(t * 24);
      g.fillText(`TC ${String(Math.floor(f / 1440)).padStart(2, '0')}:${String(Math.floor(f / 24) % 60).padStart(2, '0')}:${String(f % 24).padStart(2, '0')}  ● LIVE RENDER`, 14, h - 14);
      if (playing) raf = requestAnimationFrame(frame);
    };
    frame();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [program, playing]);
  return <canvas ref={ref} className="vid__canvas" aria-label="Real-time generative film" />;
}

export function Video({ video }: { video: VideoAsset }) {
  const [active, setActive] = useState(false);
  const reduced = useReducedMotion();
  const aspect = video.aspect ?? '16 / 9';
  const embed =
    video.kind === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`
      : video.kind === 'vimeo'
        ? `https://player.vimeo.com/video/${video.id}?autoplay=1&dnt=1&title=0&byline=0`
        : '';

  return (
    <figure className="vid">
      <div className="vid__frame" style={{ aspectRatio: aspect }}>
        {video.kind === 'generative' ? (
          <>
            <GenerativeFilm program={video.program} playing={active || !reduced} />
            {reduced && <button type="button" className="vid__toggle mono" onClick={() => setActive((a) => !a)}>{active ? 'Pause' : 'Play'} (reduced motion)</button>}
          </>
        ) : video.kind === 'file' ? (
          <video controls preload="metadata" poster={video.poster ? mediaUrl(video.poster.src) : undefined} playsInline>
            <source src={mediaUrl(video.src!)} />
            {video.captions?.map((c) => <track key={c.src} kind="captions" src={mediaUrl(c.src)} srcLang={c.lang} label={c.label} />)}
          </video>
        ) : active ? (
          <iframe src={embed} title={video.title} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen loading="lazy" />
        ) : (
          <button type="button" className="vid__facade" onClick={() => setActive(true)} aria-label={`Play video: ${video.title} (loads ${video.kind === 'youtube' ? 'YouTube' : 'Vimeo'})`}>
            {video.poster ? <Picture image={video.poster} sizes="90vw" /> : <Generative cover={{ generative: 'orbit', seed: 9 }} />}
            <span className="vid__play" aria-hidden><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></span>
            <span className="vid__src mono">{video.kind} · loads on click</span>
          </button>
        )}
      </div>
      <figcaption className="vid__cap">
        <span className="serif">{video.title}</span>
        {video.note && <span className="mono">{video.note}</span>}
      </figcaption>
    </figure>
  );
}
