#!/usr/bin/env bash
# Generates responsive WebP variants (-640.webp, -1600.webp) next to every JPG/PNG in public/images.
# Requires ImageMagick (`convert`). Run: bash scripts/optimize-images.sh
set -e
find public/images -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) | while read -r f; do
  base="${f%.*}"
  for w in 640 1600; do
    out="$base-$w.webp"
    [ -f "$out" ] && continue
    convert "$f" -resize "${w}x${w}>" -strip -quality 78 "$out"
    echo "→ $out"
  done
done
