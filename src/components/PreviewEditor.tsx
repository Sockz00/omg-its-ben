import { useEffect, useMemo, useState } from 'react';
import App from '@/App';
import rawSettings from '@/data/background.json';
import { normalizeBackgroundSettings, type BackgroundSettings } from '@/lib/ascii-settings';
import { PreviewContext } from './PreviewContext';
import './preview-editor.css';

const initial = normalizeBackgroundSettings(rawSettings);
type NumericKey = 'opacity' | 'fontSize' | 'scale' | 'offsetX' | 'offsetY' | 'rotationX' | 'rotationY' | 'rotationZ' | 'tiltX' | 'tiltY' | 'lightIntensity' | 'ambientIntensity' | 'animationSpeed';
const controls: Array<{ key: NumericKey; label: string; min: number; max: number; step: number }> = [
  { key: 'opacity', label: 'Opacity', min: 0, max: 1, step: 0.05 },
  { key: 'fontSize', label: 'Character size', min: 6, max: 24, step: 1 },
  { key: 'scale', label: 'Model size', min: 0.25, max: 3, step: 0.05 },
  { key: 'offsetX', label: 'Position left / right', min: -3, max: 3, step: 0.05 },
  { key: 'offsetY', label: 'Position down / up', min: -3, max: 3, step: 0.05 },
  { key: 'rotationX', label: 'Rotation X', min: -3, max: 3, step: 0.05 },
  { key: 'rotationY', label: 'Rotation Y', min: -3, max: 3, step: 0.05 },
  { key: 'rotationZ', label: 'Rotation Z', min: -3, max: 3, step: 0.05 },
  { key: 'tiltX', label: 'Starting tilt X', min: -3.14, max: 3.14, step: 0.05 },
  { key: 'tiltY', label: 'Starting tilt Y', min: -3.14, max: 3.14, step: 0.05 },
  { key: 'lightIntensity', label: 'Directional light', min: 0, max: 5, step: 0.1 },
  { key: 'ambientIntensity', label: 'Ambient light', min: 0, max: 5, step: 0.1 },
  { key: 'animationSpeed', label: 'GLB animation speed', min: 0, max: 3, step: 0.05 },
];

export function PreviewEditor() {
  const [draft, setDraft] = useState(initial);
  const [settings, setSettings] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [modelUrl, setModelUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSettings(normalizeBackgroundSettings(draft)), 100);
    return () => window.clearTimeout(timeout);
  }, [draft]);

  useEffect(() => {
    if (!file) { setModelUrl(''); return; }
    const url = URL.createObjectURL(file);
    setModelUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const state = useMemo(() => ({ settings, modelUrl, modelName: file?.name ?? '' }), [settings, modelUrl, file]);
  const update = <K extends keyof BackgroundSettings>(key: K, value: BackgroundSettings[K]) => setDraft(current => ({ ...current, [key]: value }));
  const copyValues = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(draft, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch { setCopied(false); }
  };

  return (
    <PreviewContext.Provider value={state}>
      <App />
      <aside className="ascii-editor" aria-label="ASCII background preview controls">
        <div className="ascii-editor-header">
          <div><span className="ascii-editor-eyebrow">live preview</span><h1>ASCII background</h1></div>
          <a href={window.location.pathname} aria-label="Close preview">×</a>
        </div>
        <p>Try settings instantly. Changes are temporary and will be lost if you reload; enter them in Pages CMS to save them.</p>
        <label className="ascii-editor-upload">3D model <input type="file" accept=".glb,.stl" onChange={event => setFile(event.target.files?.[0] ?? null)} /></label>
        <p className="ascii-editor-hint">Your file stays on this device. Upload it separately in Pages CMS when ready. Use GLB or STL without Draco or KTX2.</p>
        {file && <button type="button" className="ascii-editor-button" onClick={() => setFile(null)}>Use saved model</button>}
        <div className="ascii-editor-row"><label>Characters <input type="text" value={draft.characters} maxLength={32} onChange={e => update('characters', e.target.value)} /></label></div>
        <div className="ascii-editor-colors">
          <label>Character colour <input type="color" value={draft.color} onChange={e => update('color', e.target.value)} /></label>
          <label>Background <input type="color" value={draft.backgroundColor || '#ffffff'} onChange={e => update('backgroundColor', e.target.value)} /></label>
          <button type="button" className="ascii-editor-button" onClick={() => update('backgroundColor', '')}>Clear background</button>
        </div>
        <div className="ascii-editor-checks">
          <label><input type="checkbox" checked={draft.enabled} onChange={e => update('enabled', e.target.checked)} /> Show animation</label>
          <label><input type="checkbox" checked={draft.invert} onChange={e => update('invert', e.target.checked)} /> Invert shading</label>
          <label><input type="checkbox" checked={draft.wireframe} onChange={e => update('wireframe', e.target.checked)} /> Wireframe</label>
          <label><input type="checkbox" checked={draft.playModelAnimation} onChange={e => update('playModelAnimation', e.target.checked)} /> Play GLB animation</label>
        </div>
        <label className="ascii-editor-row">GLB animation clip name <input type="text" value={draft.animationClip} onChange={e => update('animationClip', e.target.value)} placeholder="First clip" /></label>
        {controls.map(control => <label className="ascii-editor-slider" key={control.key}>
          <span>{control.label}<output>{draft[control.key].toFixed(2)}</output></span>
          <input type="range" min={control.min} max={control.max} step={control.step} value={draft[control.key]} onChange={e => update(control.key, Number(e.target.value))} />
        </label>)}
        <div className="ascii-editor-actions"><button type="button" onClick={copyValues}>{copied ? 'Copied' : 'Copy settings'}</button><button type="button" onClick={() => setDraft(initial)}>Reset</button></div>
        <p className="ascii-editor-hint">To publish, upload your model and enter these values in Pages CMS, then save. Copy settings is a reference; it doesn’t publish them.</p>
        <details><summary>Show settings</summary><textarea readOnly value={JSON.stringify(draft, null, 2)} aria-label="Current settings as JSON" /></details>
      </aside>
    </PreviewContext.Provider>
  );
}
