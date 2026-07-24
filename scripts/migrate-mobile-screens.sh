#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Usage: $0 <source_file> <dest_file>"
  echo ""
  echo "Copies the source file to the destination, then replaces the original"
  echo "with a re-export stub that points to the new location."
  echo ""
  echo "The destination path is parsed to extract the re-export alias:"
  echo "  src/modules/<module>/screens/<ScreenName>.tsx"
  echo "becomes:"
  echo "  export { default } from '@/modules/<module>/screens/<ScreenName>';"
  exit 1
fi

SRC="$1"
DST="$2"

# Resolve relative paths to absolute
SRC="$(realpath "$SRC")"
DST="$(realpath "$DST")"

if [ ! -f "$SRC" ]; then
  echo "ERROR: source file does not exist: $SRC"
  exit 1
fi

# Create destination directory if needed
mkdir -p "$(dirname "$DST")"

# 1. Copy the source content to the new destination
cp "$SRC" "$DST"
echo "COPIED: $SRC → $DST"

# 2. Derive the re-export path relative to src/modules/... from DST
#    e.g. /home/.../mobile/src/modules/home/screens/CustomerHomeScreen.tsx
#    becomes  @/modules/home/screens/CustomerHomeScreen
REL="${DST#*/src/}"
REL="${REL%.tsx}"

STUB="export { default } from '@/${REL}';"

# 3. Overwrite the original file with the re-export stub
echo "$STUB" > "$SRC"
echo "STUB:   $SRC ← $STUB"
