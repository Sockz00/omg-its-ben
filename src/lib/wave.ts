export function waveRadius(x: number, y: number, width: number, height: number) {
  return Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
}
