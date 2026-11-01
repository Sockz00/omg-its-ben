export type BackgroundSettings = {
  enabled: boolean;
  model: string;
  color: string;
  backgroundColor: string;
  opacity: number;
  fontSize: number;
  characters: string;
  invert: boolean;
  wireframe: boolean;
  playModelAnimation: boolean;
  animationClip: string;
  animationSpeed: number;
  lightIntensity: number;
  ambientIntensity: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  tiltX: number;
  tiltY: number;
};

export const defaultBackgroundSettings: BackgroundSettings = {
  enabled: true,
  model: '',
  color: '#999999',
  backgroundColor: '',
  opacity: 0.65,
  fontSize: 10,
  characters: ' .:-=+*#%@',
  invert: false,
  wireframe: false,
  playModelAnimation: true,
  animationClip: '',
  animationSpeed: 1,
  lightIntensity: 2.5,
  ambientIntensity: 1.5,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotationX: 0.08,
  rotationY: 0.22,
  rotationZ: 0,
  tiltX: 0.35,
  tiltY: 0.2,
};

export function normalizeBackgroundSettings(input: unknown): BackgroundSettings {
  const data = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const n = (name: keyof BackgroundSettings, min: number, max: number) => {
    const value = data[name];
    return typeof value === 'number' && Number.isFinite(value)
      ? Math.max(min, Math.min(max, value))
      : defaultBackgroundSettings[name] as number;
  };
  const flag = (name: 'enabled' | 'invert' | 'wireframe' | 'playModelAnimation') =>
    typeof data[name] === 'boolean' ? data[name] as boolean : defaultBackgroundSettings[name];
  const model = typeof data.model === 'string' && /^\/models\/[^?#]+\.(?:glb|stl)$/i.test(data.model)
    ? data.model : '';
  return {
    enabled: flag('enabled'), model,
    color: typeof data.color === 'string' && /^#[0-9a-f]{6}$/i.test(data.color) ? data.color : defaultBackgroundSettings.color,
    backgroundColor: typeof data.backgroundColor === 'string' && /^#[0-9a-f]{6}$/i.test(data.backgroundColor) ? data.backgroundColor : '',
    opacity: n('opacity', 0, 1), fontSize: n('fontSize', 6, 24),
    characters: typeof data.characters === 'string' && data.characters.trim().length && data.characters.length >= 2
      ? data.characters.slice(0, 32) : defaultBackgroundSettings.characters,
    invert: flag('invert'), wireframe: flag('wireframe'), playModelAnimation: flag('playModelAnimation'), scale: n('scale', 0.25, 3),
    animationClip: typeof data.animationClip === 'string' ? data.animationClip.trim().slice(0, 200) : '',
    animationSpeed: n('animationSpeed', 0, 3), lightIntensity: n('lightIntensity', 0, 5), ambientIntensity: n('ambientIntensity', 0, 5),
    offsetX: n('offsetX', -3, 3), offsetY: n('offsetY', -3, 3),
    rotationX: n('rotationX', -3, 3), rotationY: n('rotationY', -3, 3), rotationZ: n('rotationZ', -3, 3),
    tiltX: n('tiltX', -3.14, 3.14), tiltY: n('tiltY', -3.14, 3.14),
  };
}

export function cameraDistanceForViewport(width: number, height: number): number {
  const aspect = Math.max(0.1, Math.max(1, width) / Math.max(1, height));
  return 4.8 / Math.min(1, aspect);
}
