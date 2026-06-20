#!/usr/bin/env bash
# Converts the recorded WebM promo/demo into MP4, and produces a narrated
# variant with a synthesized voiceover. Requires: ffmpeg, espeak-ng.
# Run from the receipts-app directory.
set -euo pipefail

OUT="videos-mp4"
mkdir -p "$OUT"

# Synthesize narration → /tmp/$1.wav. Prefers Piper (natural neural voice, set
# PIPER_MODEL to an .onnx), and falls back to espeak-ng so it always produces audio.
synth () {
  local name="$1" narration="$2"
  local text; text=$(tr '\n' ' ' < "$narration")
  rm -f "/tmp/$name.wav"
  if [ -n "${PIPER_MODEL:-}" ] && [ -f "${PIPER_MODEL}" ]; then
    echo "$text" | python3 -m piper --model "$PIPER_MODEL" --output_file "/tmp/$name.wav" 2>/dev/null || \
    echo "$text" | piper --model "$PIPER_MODEL" --output_file "/tmp/$name.wav" 2>/dev/null || true
    [ -f "/tmp/$name.wav" ] && echo "   voice: piper"
  fi
  if [ ! -f "/tmp/$name.wav" ]; then
    espeak-ng -f "$narration" -w "/tmp/$name.wav" -s 160 -p 45 2>/dev/null || true
    [ -f "/tmp/$name.wav" ] && echo "   voice: espeak-ng (fallback)"
  fi
}

make_one () {
  local name="$1" src="$2" narration="$3"
  [ -f "$src" ] || { echo "skip $name — missing $src"; return 0; }

  echo "==> $name: $src"
  # Silent MP4 (H.264 / yuv420p for universal playback)
  ffmpeg -y -loglevel error -i "$src" \
    -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart \
    "$OUT/$name.mp4"

  # Narrated MP4 (synth voiceover, padded/trimmed to the video length)
  if [ -f "$narration" ]; then
    synth "$name" "$narration"
    if [ -f "/tmp/$name.wav" ]; then
      local dur
      dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
      ffmpeg -y -loglevel error -i "$src" -i "/tmp/$name.wav" \
        -filter_complex "[1:a]apad,volume=1.4[a]" \
        -map 0:v -map "[a]" \
        -c:v libx264 -pix_fmt yuv420p -crf 20 -c:a aac -b:a 160k \
        -t "$dur" -movflags +faststart \
        "$OUT/$name-narrated.mp4"
    fi
  fi
}

make_one "receipts-promo" "promo/receipts-promo.webm" "scripts/narration/promo.txt"
make_one "receipts-demo"  "demo/receipts-demo.webm"   "scripts/narration/demo.txt"

echo "== done =="
ls -la "$OUT"
